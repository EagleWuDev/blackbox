
import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { Router, Scene, Actions, Modal } from 'react-native-router-flux';

const Archive = require('./components/archive/index');
const Camera  = require('./components/camera/index');
const Data  = require('./components/data/index');
const History = require('./components/history/index');
const Login   = require('./components/login/index');
const Signup  = require('./components/signup/index');

var app = React.createClass({
  render() {
    return (
      <Router>
        <Scene key='root'>
          <Scene hideNavBar={true} key='Archive' component={Archive} title='Archive' />
          <Scene hideNavBar={true} key='Data' component={Data} title='Data' initial={false} />
          <Scene hideNavBar={true} key='Camera' component={Camera} title='Camera' initial={true} />
          <Scene hideNavBar={true} key='History' component={History} title='History' />
          <Scene hideNavBar={true} key='Login' component={Login} title='Login' />
          <Scene hideNavBar={true} key='Signup' component={Signup} title='Signup' />
        </Scene>
      </Router>
    )
  }
})

AppRegistry.registerComponent('streamchain', () => streamchain);
