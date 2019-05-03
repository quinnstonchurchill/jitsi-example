import React, { Fragment } from 'react';
import { Provider } from 'mobx-react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import { setupRootStore } from '../models/RootStore';
import EntryScreen from './EntryScreen';
import Conference from './Conference';

class App extends React.Component {
  async componentDidMount() {
    this.setState({
      rootStore: await setupRootStore()
    });
  }
  render() {
    const rootStore = this.state && this.state.rootStore;

    // wait for environment to be ready before showing app
    if (!rootStore) {
      return null;
    }

    return (
      <Provider
        rootStore={rootStore}
        connectionStore={rootStore.connectionStore}
      >
        <Router>
          <Fragment>
            <Route path="/" exact component={EntryScreen} />
            <Route path="/conference" component={Conference} />
          </Fragment>
        </Router>
      </Provider>
    );
  }
}

export default App;
