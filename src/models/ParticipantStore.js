import { types, getRoot } from 'mobx-state-tree';
import { values } from 'mobx';
import omit from 'lodash/omit';

import Participant from './Participant';

const ParticipantStore = types
  .model('ParticipantStore')
  .props({
    participants: types.map(Participant),
    dominantParticipant: types.maybe(types.reference(Participant))
  })
  .views(self => ({
    getParticipant(id) {
      return self.participants.get(id);
    },
    getParticipantsAsArray() {
      return values(self.participants);
    }
  }))
  .actions(self => ({
    addParticipant(participant, tracks) {
      self.participants.set(participant._id, participant);
      if (tracks) {
        self.participants.get(participant._id).addTracks(tracks);
      }
    },
    removeParticipant(id) {
      if (self.participants.has(id)) {
        const pv = values(self.participants);
        let pickDominantParticipant = false;
        if (self.dominantParticipant._id === id) {
          pickDominantParticipant = true;
        }

        self.participants.get(id).cleanUp();
        self.participants.delete(id);

        if (pickDominantParticipant) {
          const next = pv.filter(entry => entry._id !== id);
          self.dominantParticipant = next.length > 0 ? next[0] : null;
        }
      }
    },
    setDominantParticipant(id) {
      console.log('setting dominant participant');
      if (self.participants.has(id)) {
        console.log(id);
        self.dominantParticipant = id;
      } else {
        console.log(`user ${id} not found!!`);
      }
    },
    addTrackForParticipant(id, track) {
      const participant = self.participants.get(id);
      participant.addTrack(track);
    },
    removeTrackForParticipant(id, track) {
      const participant = self.participants.get(id);
      if (participant) {
        participant.removeTrack(track);
      }
    }
  }))
  .actions(self => ({
    cleanUp() {
      self.dominantParticipant = null;
      const participantValues = values(self.participants);
      for (let i = 0; i < participantValues.length; i++) {
        participantValues[i].cleanUp();
      }
      self.participants.clear();
    }
  }));
// .postProcessSnapshot(snapshot => {
//   return omit(snapshot, ['dominantParticipant']);
// });

export default ParticipantStore;
