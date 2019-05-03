import React from 'react';
import { observer, inject } from 'mobx-react';
import flowRight from 'lodash/flowRight';
import { Button } from 'rebass';

const enhance = flowRight(
  inject('connectionStore'),
  observer
);

class EntryScreen extends React.Component {
  joinConference = () => {
    this.props.connectionStore.setRoom('dankmemes');
    this.props.connectionStore.setDisplayName('Quinn');
    this.props.history.push('/conference');
  };
  render() {
    return <Button onClick={this.joinConference}>Connect</Button>;
  }
}

export default enhance(EntryScreen);
