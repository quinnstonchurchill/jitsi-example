import React, { Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import flowRight from 'lodash/flowRight';
import { Button, Flex } from 'rebass';

const enhance = flowRight(
  inject('connectionStore'),
  observer
);

class Conference extends React.Component {
  video = React.createRef();
  async componentDidMount() {
    await this.props.connectionStore.connect();
    const dominantParticipantVideoStream = this.getDominantVideoStream();
    console.log(dominantParticipantVideoStream);
    this.attachVideo(dominantParticipantVideoStream);
  }
  attachVideo = track => {
    console.log(track);
    if (!track || !track.jitsiTrack) {
      return;
    }

    track.jitsiTrack.attach(this.video);
  };
  getDominantVideoStream = () => {
    const participantStore = this.props.connectionStore.conference
      .participantStore;
    const dominantParticipantVideoStream =
      participantStore.dominantParticipant &&
      participantStore.dominantParticipant.hasVideoTrack()
        ? participantStore.dominantParticipant.tracks[
            'video'
          ].jitsiTrack.getOriginalStream()
        : null;

    return dominantParticipantVideoStream;
  };
  render() {
    console.log(this.props.connectionStore.conference.toJSON());
    const joining = this.props.connectionStore.conference.joining;

    return (
      <Flex flexDirection="column" alignItems="center">
        <video autoPlay ref={this.video} />
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
