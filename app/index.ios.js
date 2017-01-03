
import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { Router, Scene, Actions, Modal } from 'react-native-router-flux';

const Archive = require('./components/archive/index');
const History = require('./components/history/index');
const Login   = require('./components/login/index');
const Signup  = require('./components/signup/index');
// const Stream  = require('./components/stream/index');
const Camera  = require('./components/camera/index');

var app = React.createClass({
  render() {
    return (
      <Router>
        <Scene key='root'>
          <Scene hideNavBar={true} key='Archive' component={Archive} title='Archive' />
          <Scene hideNavBar={true} key='History' component={History} title='History' />
          <Scene hideNavBar={true} key='Login' component={Login} title='Login' />
          <Scene hideNavBar={true} key='Signup' component={Signup} title='Signup' />
          <Scene hideNavBar={true} key='Camera' component={Camera} title='Camera' initial={true} />
        </Scene>
      </Router>
    )
  }
})

AppRegistry.registerComponent('streamchain', () => app);
