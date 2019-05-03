/* global JitsiMeetJS */
import $ from 'jquery';
import {
  ConnectionErrors,
  ConnectionEvents,
  ConferenceErrors,
  ConferenceEvents,
  TrackErrors,
  TrackEvents
} from './libJitsiMeet';

/**
 * config for JitsiConnection
 *
 * * JitsiFunky is fetching the config from https://meet.jit.si/config.js?room=${roomName} in app/services/jitsi-api/jitsi-api.ts
 * * Passes is room created at runtime
 * ? Should we pull the config and override certain parts?
 */
const connectionOptions = {
  hosts: {
    domain: 'meet.jit.si',
    muc: 'conference.meet.jit.si',
    focus: 'focus.meet.jit.si'
  },
  // FIXME: use xep-0156 for that
  bosh: 'http://meet.jit.si/http-bind?room=boof',
  // The name of client node advertised in XEP-0115 'c' stanza
  clientNode: 'http://jitsi.org/jitsimeet',
  // ! deprecated desktop sharing settings, included only because older version of jitsi-meet require them
  desktopSharing: 'ext', // Desktop sharing method. Can be set to 'ext', 'webrtc' or false to disable.
  chromeExtensionId: 'kglhbbefdnlheedjiejgomgmfplipfeb', // Id of desktop streamer Chrome extension
  desktopSharingSources: ['screen', 'window'],
  googleApiApplicationClientID:
    '39065779381-bbhnkrgibtf4p0j9ne5vsq7bm49t1tlf.apps.googleusercontent.com',
  microsoftApiApplicationClientID: '00000000-0000-0000-0000-000040240063',
  enableCalendarIntegration: true,
  // ! new desktop sharing settings
  desktopSharingChromeExtId: 'kglhbbefdnlheedjiejgomgmfplipfeb', // Id of desktop streamer Chrome extension
  desktopSharingChromeDisabled: false,
  desktopSharingChromeSources: ['screen', 'window', 'tab'],
  desktopSharingChromeMinExtVersion: '0.2.6.2', // Required version of Chrome extension
  desktopSharingFirefoxExtId: '',
  desktopSharingFirefoxDisabled: false,
  desktopSharingFirefoxMaxVersionExtRequired: '0',
  desktopSharingFirefoxExtensionURL: ''
};

/**
 * config for JitsiConference
 */
const conferenceOptions = {
  openBridgeChannel: true
};

/**
 * JitsiMeetJS API Manager
 *
 * Singleton instance is exported for use across application
 * Todos
 * - modularize init, connection, & conference
 * - pass in room name, display name
 */
class JitsiMeet {
  constructor() {
    this.isJoined = false;
    this.isVideo = true;

    // JitsiConnection instance
    this.connection = null;

    // JitsiConference instance
    this.room = null;

    // local & remote JitsiTrack instances
    this.localTracks = [];
    this.remoteTracks = {};

    JitsiMeetJS.init();
    // this.connect();
    // this.createLocalTracks();
  }

  connect = () => {
    console.log('connecting');
    this.connection = new JitsiMeetJS.JitsiConnection(
      null,
      null,
      connectionOptions
    );

    this.connection.addEventListener(
      ConnectionEvents.CONNECTION_ESTABLISHED,
      this.onConnectionSuccess
    );
    this.connection.addEventListener(
      ConnectionEvents.CONNECTION_FAILED,
      this.onConnectionFailed
    );
    this.connection.addEventListener(
      ConnectionEvents.CONNECTION_DISCONNECTED,
      this.disconnect
    );

    this.connection.connect();
  };

  changeAudioOutput = selected => {
    // eslint-disable-line no-unused-vars
    JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value);
  };

  createLocalTracks = () => {
    JitsiMeetJS.createLocalTracks({ devices: ['audio', 'video'] })
      .then(this.onLocalTracks)
      .catch(error => {
        throw error;
      });
  };

  disconnect = () => {
    console.log('disconnect!');
    this.connection.removeEventListener(
      ConnectionEvents.CONNECTION_ESTABLISHED,
      this.onConnectionSuccess
    );
    this.connection.removeEventListener(
      ConnectionEvents.CONNECTION_FAILED,
      this.onConnectionFailed
    );
    this.connection.removeEventListener(
      ConnectionEvents.CONNECTION_DISCONNECTED,
      this.disconnect
    );
  };

  switchVideo = () => {
    // eslint-disable-line no-unused-vars
    this.isVideo = !this.isVideo;
    if (this.localTracks[1]) {
      this.localTracks[1].dispose();
      this.localTracks.pop();
    }

    JitsiMeetJS.createLocalTracks({
      devices: [this.isVideo ? 'video' : 'desktop']
    })
      .then(tracks => {
        this.localTracks.push(tracks[0]);
        this.localTracks[1].addEventListener(
          TrackEvents.TRACK_MUTE_CHANGED,
          () => console.log('local track muted')
        );
        this.localTracks[1].addEventListener(
          TrackEvents.LOCAL_TRACK_STOPPED,
          () => console.log('local track stoped')
        );
        this.localTracks[1].attach($('#localVideo1')[0]);
        this.room.addTrack(this.localTracks[1]);
      })
      .catch(error => console.log(error));
  };

  onConferenceJoined = () => {
    console.log('conference joined!');
    this.isJoined = true;
    for (let i = 0; i < this.localTracks.length; i++) {
      this.room.addTrack(this.localTracks[i]);
    }
  };

  /**
   * runs when server connection is established
   */
  onConnectionSuccess = () => {
    // TODO move this to separate file
    this.room = this.connection.initJitsiConference(
      'conference',
      conferenceOptions
    );
    this.room.on(ConferenceEvents.TRACK_ADDED, this.onRemoteTrack);
    this.room.on(ConferenceEvents.TRACK_REMOVED, track => {
      console.log(`track removed!!!${track}`);
    });
    this.room.on(ConferenceEvents.CONFERENCE_JOINED, this.onConferenceJoined);
    this.room.on(ConferenceEvents.USER_JOINED, id => {
      console.log('user join');
      this.remoteTracks[id] = [];
    });
    this.room.on(ConferenceEvents.USER_LEFT, this.onUserLeft);
    this.room.on(ConferenceEvents.TRACK_MUTE_CHANGED, track => {
      console.log(`${track.getType()} - ${track.isMuted()}`);
    });
    this.room.on(ConferenceEvents.DISPLAY_NAME_CHANGED, (userID, displayName) =>
      console.log(`${userID} - ${displayName}`)
    );
    this.room.on(
      ConferenceEvents.TRACK_AUDIO_LEVEL_CHANGED,
      (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`)
    );
    this.room.on(ConferenceEvents.PHONE_NUMBER_CHANGED, () =>
      console.log(`${this.room.getPhoneNumber()} - ${this.room.getPhonePin()}`)
    );
    this.room.join();
  };

  onConnectionFailed() {
    console.error('Connection Failed!');
  }

  onDeviceListChanged(devices) {
    console.info('current devices', devices);
  }

  /**
   * Handles local tracks.
   * @param tracks Array with JitsiTrack objects
   */
  onLocalTracks = tracks => {
    this.localTracks = tracks;
    for (let i = 0; i < this.localTracks.length; i++) {
      this.localTracks[i].addEventListener(
        TrackEvents.TRACK_AUDIO_LEVEL_CHANGED,
        audioLevel => console.log(`Audio Level local: ${audioLevel}`)
      );

      this.localTracks[i].addEventListener(TrackEvents.TRACK_MUTE_CHANGED, () =>
        console.log('local track muted')
      );

      this.localTracks[i].addEventListener(
        TrackEvents.LOCAL_TRACK_STOPPED,
        () => console.log('local track stoped')
      );

      this.localTracks[i].addEventListener(
        TrackEvents.TRACK_AUDIO_OUTPUT_CHANGED,
        deviceId =>
          console.log(`track audio output device was changed to ${deviceId}`)
      );

      // TODO append to DOM
      if (this.localTracks[i].getType() === 'video') {
        $('body').append(`<video autoplay='1' id='localVideo${i}' />`);
        this.localTracks[i].attach($(`#localVideo${i}`)[0]);
      } else {
        $('body').append(
          `<audio autoplay='1' muted='true' id='localAudio${i}' />`
        );
        this.localTracks[i].attach($(`#localAudio${i}`)[0]);
      }

      if (this.isJoined) {
        this.room.addTrack(this.localTracks[i]);
      }
    }
  };

  /**
   * Handles remote tracks
   * @param track JitsiTrack object
   */
  onRemoteTrack = track => {
    if (track.isLocal()) {
      return;
    }
    const participant = track.getParticipantId();

    if (!this.remoteTracks[participant]) {
      this.remoteTracks[participant] = [];
    }
    const idx = this.remoteTracks[participant].push(track);

    track.addEventListener(TrackEvents.TRACK_AUDIO_LEVEL_CHANGED, audioLevel =>
      console.log(`Audio Level remote: ${audioLevel}`)
    );
    track.addEventListener(TrackEvents.TRACK_MUTE_CHANGED, () =>
      console.log('remote track muted')
    );
    track.addEventListener(TrackEvents.LOCAL_TRACK_STOPPED, () =>
      console.log('remote track stoped')
    );
    track.addEventListener(TrackEvents.TRACK_AUDIO_OUTPUT_CHANGED, deviceId =>
      console.log(`track audio output device was changed to ${deviceId}`)
    );
    const id = participant + track.getType() + idx;

    // TODO this without jquery
    if (track.getType() === 'video') {
      $('body').append(`<video autoplay='1' id='${participant}video${idx}' />`);
      // const video = document.createElement('video');
      // video.autoplay = 1;
      // video.id = `${participant}video${idx}`;
      // document.body.appendChild(video);
    } else {
      $('body').append(`<audio autoplay='1' id='${participant}audio${idx}' />`);
      // const audio = document.createElement('audio');
      // audio.autoplay = 1;
      // audio.id = `${participant}audio${idx}`;
      // document.body.appendChild(audio);
    }
    track.attach($(`#${id}`)[0]);
    // track.attach(document.getElementById(id));
  };

  /**
   *
   * @param id
   */
  onUserLeft = id => {
    console.log('user left');
    if (!this.remoteTracks[id]) {
      return;
    }
    const tracks = this.remoteTracks[id];

    for (let i = 0; i < tracks.length; i++) {
      // TODO this without jquery
      tracks[i].detach($(`#${id}${tracks[i].getType()}`));
    }
  };
}

const instance = new JitsiMeet();

export default instance;
