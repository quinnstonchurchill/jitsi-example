import { types, flow, getEnv } from 'mobx-state-tree';
import omit from 'lodash/omit';

import { ConnectionEvents } from '../jitsi-meet/libJitsiMeet';
import ConferenceStore from './ConferenceStore';

const ConnectionStore = types
  .model('ConnectionStore', {
    connected: types.optional(types.boolean, false),
    conference: types.optional(ConferenceStore, {})
  })
  .volatile(self => ({
    connection: null
  }))
  .views(self => ({
    getConnection() {
      return self.connection;
    },
    getConference() {
      return self.conference;
    },
    isConnected() {
      return self.connected;
    }
  }))
  .actions(self => ({
    onConnectionDisconnect() {
      console.log('disconnected');
      self.connected = false;
    },
    onConnectionEstablished() {
      console.log('connected');
      self.conference.createConference(self.conference.room);
      self.connected = true;
    },
    onConnectionFailed() {
      console.log('failed');
      self.connected = false;
    },
    setRoom(room) {
      self.conference.room = room;
    },
    setDisplayName(name) {
      self.conference.displayName = name;
    }
  }))
  .actions(self => ({
    // ! Might need async if I need to pull config from meet.jit.si
    connect() {
      const config = getEnv(self).connectionOptions;
      const jitsiMeet = getEnv(self).jitsiMeet;

      self.connection = new jitsiMeet.JitsiConnection(null, null, config);

      self.connection.addEventListener(
        ConnectionEvents.CONNECTION_DISCONNECTED,
        self.onConnectionDisconnect
      );
      self.connection.addEventListener(
        ConnectionEvents.CONNECTION_ESTABLISHED,
        self.onConnectionEstablished
      );
      self.connection.addEventListener(
        ConnectionEvents.CONNECTION_FAILED,
        self.onConnectionFailed
      );

      self.connection.connect();
    },
    disconnect() {
      if (self.connection && self.connected) {
        self.conference.cleanUp();
        self.connection.removeEventListener(
          ConnectionEvents.CONNECTION_DISCONNECTED,
          self.onConnectionDisconnect
        );
        self.connection.removeEventListener(
          ConnectionEvents.CONNECTION_ESTABLISHED,
          self.onConnectionEstablished
        );
        self.connection.removeEventListener(
          ConnectionEvents.CONNECTION_FAILED,
          self.onConnectionFailed
        );
        self.connection.disconnect();
        self.connection = null;
        self.connected = false;
      }
    }
  }));
// .postProcessSnapshot(snapshot => {
//   return omit(snapshot, ['connected']);
// });

export default ConnectionStore;
