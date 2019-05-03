import { types } from 'mobx-state-tree';
import omit from 'lodash/omit';

const Participant = types
  .model('Participant')
  .props({
    // used to find dominant participant
    _id: types.identifier,
    _displayName: types.maybeNull(types.string),
    _isLocal: types.optional(types.boolean, false),
    _connectionStatus: types.optional(types.string, 'undefined')
  })
  .volatile(self => ({
    tracks: {}
  }))
  .views(self => ({
    hasVideoTrack() {
      return self.tracks && self.tracks.video;
    }
  }))
  .actions(self => ({
    addTrack(track) {
      self.tracks[track.mediaType] = track;
    },
    removeTrack(track) {
      if (self.tracks && self.tracks[track.mediaType]) {
        delete self.tracks[track.mediaType];
      }
    }
  }))
  .actions(self => ({
    cleanUp() {
      self.tracks = {};
    },
    addTracks(tracks) {
      tracks.forEach(track => {
        self.addTrack(track);
      });
    }
  }));
// .postProcessSnapshot(snapshot => {
//   return omit(snapshot, ['_connectionStatus']);
// });

export default Participant;
