import { types, getRoot, flow, getEnv } from 'mobx-state-tree';
import omit from 'lodash/omit';

import { ConferenceEvents } from '../jitsi-meet/libJitsiMeet';
import ParticipantStore from './ParticipantStore';

const ConferenceStore = types
  .model('ConferenceStore')
  .volatile(self => ({
    conference: null,
    localTracks: []
  }))
  .props({
    room: types.maybeNull(types.string),
    participantStore: types.optional(ParticipantStore, {}),
    displayName: types.optional(types.string, 'me'),
    joining: types.optional(types.boolean, true)
    // TODO add messages
  })
  .actions(self => ({
    addTracks(tracks) {
      console.log('addTracks');
      for (let i = 0; i < tracks.length; i++) {
        self.participantStore.addTrackForParticipant(
          tracks[i].participantId,
          tracks[i]
        );
      }
    }
  }))
  .actions(self => ({
    onConferenceJoined() {
      console.log('onConferenceJoined');
      const localParticipantId =
        self.conference.p2pDominantSpeakerDetection.myUserID;

      const localTracks = self.localTracks;

      if (localTracks) {
        for (let i = 0; i < localTracks.length; i++) {
          localTracks[i].participantId = localParticipantId;
          self.conference.addTrack(localTracks[i].jitsiTrack);
        }
      }

      const localParticipant = {
        _id: localParticipantId,
        _displayName: self.displayName,
        _isLocal: true,
        _connectionStatus: 'active'
      };

      self.participantStore.addParticipant(localParticipant, localTracks);
      self.participantStore.setDominantParticipant(localParticipantId);
      self.conference.setDisplayName(self.displayName);

      self.joining = false;
    },
    onTrackRemoved(track) {
      console.log(`track removed!!!${track}`);
      self.participantStore.removeTrackForParticipant(
        track.getParticipantId(),
        track
      );
    },
    onUserJoined(id, user) {
      console.log('user joined', user);
      const participant = {
        _id: user._id,
        _displayName: user._displayName,
        _isLocal: false,
        _connectionStatus: user._connectionStatus
      };

      self.participantStore.addParticipant(participant, null);
    },
    onDominantSpeakerChanged(id, room) {
      console.log('dominant user changed: ', id);
      self.participantStore.setDominantParticipant(id);
    },
    onUserLeft(id, user) {
      self.participantStore.removeParticipant(id);
    },
    onConferenceFailed(error) {
      if (self.joining) {
        self.joining = false;
      }
      console.log(`Conference Failed: ${error}`);
    },
    onConferenceError(error) {
      console.log(`Conference Failed: ${error}`);
    },
    onUserStatusChanged(id, status) {
      console.log(`user status changed: ${id} ${status}`);
    },
    onTrackAdded(track) {
      if (!track.isLocal()) {
        const remoteTrack = {
          jitsiTrack: track,
          local: false,
          mediaType: track.getType(),
          mirror: track.getType() === 'video',
          muted: track.isMuted(),
          participantId: track.getParticipantId(),
          videoStarted: false,
          videoType: track.videoType
        };
        self.addTracks([remoteTrack]);
      }
    }
  }))
  .actions(self => ({
    createLocalTracks: flow(function* createLocalTracks() {
      const jitsiMeet = getEnv(self).jitsiMeet;
      const tracks = yield jitsiMeet.createLocalTracks({
        devices: ['audio', 'video']
      });

      for (let i = 0; i < tracks.length; i++) {
        let track = {
          jitsiTrack: tracks[i],
          local: true,
          mediaType: tracks[i].getType(),
          mirror: tracks[i].getType() === 'video',
          muted: tracks[i].isMuted(),
          participantId: '-999',
          videoStarted: false,
          videoType: tracks[i].videoType
        };

        self.localTracks.push(track);
      }
    })
  }))
  .actions(self => ({
    beforeDestroy() {
      self.localTracks = null;
    },
    afterCreate() {
      self
        .createLocalTracks()
        .then(() => {
          console.log('local tracks created');
        })
        .catch(error => {
          console.log(error);
        });
    }
  }))
  .actions(self => ({
    createConference(room) {
      self.joining = true;
      const connection = getRoot(self).connectionStore.getConnection();

      // bind room to Conference & create cofference
      self.room = room;
      self.conference = connection.initJitsiConference(room, {
        openBridgeChannel: true
      });

      // conference event handlers
      self.conference.on(ConferenceEvents.TRACK_ADDED, self.onTrackAdded);
      self.conference.on(ConferenceEvents.TRACK_REMOVED, self.onTrackRemoved);
      self.conference.on(
        ConferenceEvents.CONFERENCE_JOINED,
        self.onConferenceJoined
      );
      self.conference.on(ConferenceEvents.USER_JOINED, self.onUserJoined);
      self.conference.on(
        ConferenceEvents.DOMINANT_SPEAKER_CHANGED,
        self.onDominantSpeakerChanged
      );
      self.conference.on(ConferenceEvents.USER_LEFT, self.onUserLeft);
      self.conference.on(
        ConferenceEvents.CONFERENCE_FAILED,
        self.onConferenceFailed
      );
      self.conference.on(
        ConferenceEvents.CONFERENCE_ERROR,
        self.onConferenceError
      );
      self.conference.on(
        ConferenceEvents.USER_STATUS_CHANGED,
        self.onUserStatusChanged
      );
      // self.conference.on(
      //   ConferenceEvents.MESSAGE_RECEIVED,
      //   self.onMessageReceived
      // );

      // join conference as Participant
      self.conference.join();
    },
    cleanUp() {
      // self.lastReadMessage = null;
      // self.messages.clear();

      self.participantStore.cleanUp();
      const conference = self.conference;

      conference.off(ConferenceEvents.CONFERENCE_ERROR, self.onConferenceError);
      conference.off(
        ConferenceEvents.CONFERENCE_FAILED,
        self.onConferenceFailed
      );
      conference.off(ConferenceEvents.USER_LEFT, self.onUserLeft);
      conference.off(
        ConferenceEvents.DOMINANT_SPEAKER_CHANGED,
        self.onDominantSpeakerChanged
      );
      conference.off(
        ConferenceEvents.CONFERENCE_JOINED,
        self.onConferenceJoined
      );
      conference.off(ConferenceEvents.USER_JOINED, self.onUserJoined);
      conference.off(ConferenceEvents.TRACK_ADDED, self.onTrackAdded);
      conference.off(ConferenceEvents.TRACK_REMOVED, self.onTrackRemoved);
      conference.off(
        ConferenceEvents.USER_STATUS_CHANGED,
        self.onUserStatusChanged
      );
      // conference.off(ConferenceEvents.MESSAGE_RECEIVED, self.onMessageReceived);

      conference
        .leave()
        .then(() => {
          console.log('left');
          self.conference = null;
        })
        .catch(e => {
          console.log(e);
        });
    }
  }));
// .postProcessSnapshot(snapshot => {
//   return omit(snapshot, ['room', 'displayName', 'participantStore']);
// });

export default ConferenceStore;
