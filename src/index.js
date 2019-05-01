import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { Normalize } from 'styled-normalize';

import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';

const theme = {
  breakpoints: {
    d: 0,
    sm: 600,
    md: 960,
    lg: 1200
  },
  colors: {
    white: '#ffffff',
    background: '#f2f4f7',
    greys: [
      'rgb(219, 219, 219)',
      'rgb(193, 193, 193)',
      'rgb(117, 126, 135)',
      'rgb(102, 125, 144)',
      'rgb(70, 87, 104)'
    ],
    darkGrey: '#24282c',
    red: '#f62f37',
    green: '#00c662',
    yellow: '#ffdc50',
    blue: '#00baff'
  }
};

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Fragment>
      <App />
      <Normalize />
    </Fragment>
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
