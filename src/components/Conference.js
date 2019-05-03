import React, { Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import flowRight from 'lodash/flowRight';
import { Button, Flex } from 'rebass';

const enhance = flowRight(
  inject('connectionStore'),
  observer
);

// function shouldRenderVideo(video, waitForVideoStarted) {
//   if (video && !video.muted && (waitForVideoStarted || video.videoStarted)) {
//     return true;
//   } else {
//     return false;
//   }
// }

const shouldRenderVideo = (video, waitForVideoStarted) =>
  video && !video.muted && (waitForVideoStarted || video.videoStarted);

class Conference extends React.Component {
  video = React.createRef();
  audio = React.createRef();
  async componentDidMount() {
    await this.props.connectionStore.connect();
    const dominantParticipantVideoTrack = this.getDominantVideoStream();
    this.attachVideo(dominantParticipantVideoTrack);
    // TODO maybe do this without updating
    this.forceUpdate();
  }
  componentDidUpdate() {
    const dominantParticipantVideoTrack = this.getDominantVideoStream();
    this.attachVideo(dominantParticipantVideoTrack);

    // const { audio, video } = this.getDominantTracks();
    // video.attach(this.video.current);
    // audio.attach(this.audio.current);
  }
  attachAudio = track => {
    if (!track) {
      return;
    }

    track.attach(this.audio.current);
  };
  attachVideo = track => {
    if (!track) {
      console.log('no track');
      return;
    }

    console.log('track exists');
    track.attach(this.video.current);
  };
  getDominantTracks = () => {
    const { participantStore } = this.props.connectionStore.conference;

    const dominantTracks =
      participantStore.dominantParticipant &&
      participantStore.dominantParticipant.hasTracks() &&
      participantStore.dominantParticipant.tracks;
    console.log(dominantTracks);

    return {
      audio: dominantTracks.audio.jitsiTrack,
      video: dominantTracks.video.jitsiTrack
    };
  };
  // TODO
  getDominantAudioStream = () => {};
  getDominantVideoStream = () => {
    const participantStore = this.props.connectionStore.conference
      .participantStore;

    const dominantParticipantVideoTrack =
      participantStore.dominantParticipant &&
      participantStore.dominantParticipant.hasVideoTrack() &&
      participantStore.dominantParticipant.tracks.video.jitsiTrack;

    console.log(dominantParticipantVideoTrack);

    return dominantParticipantVideoTrack;
  };
  render() {
    // console.log(this.props.connectionStore.conference.toJSON());
    const joining = this.props.connectionStore.conference.joining;
    console.log('joining: ', joining);

    return (
      <Flex flexDirection="column" alignItems="center">
        <video autoPlay ref={this.video} />
        <audio autoPlay ref={this.audio} />
        <Button
          backgroundColor="red"
          onClick={this.props.connectionStore.disconnect}
        >
          Disconnect
        </Button>
      </Flex>
    );
  }
}

export default enhance(Conference);
