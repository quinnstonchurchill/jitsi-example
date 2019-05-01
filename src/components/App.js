import React from 'react';
import { Button } from 'rebass';

import JitsiMeet from '../jitsi-meet/JitsiMeet';

export default class App extends React.Component {
  connect() {
    JitsiMeet.connect();
    JitsiMeet.createLocalTracks();
  }
  render() {
    return <Button onClick={this.connect}>Connect</Button>;
  }
}
