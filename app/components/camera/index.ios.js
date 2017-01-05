import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  Alert,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Camera from 'react-native-camera';

const Permissions = require('react-native-permissions');

import NavArrow from '../toolbox/NavArrow';

const {height, width} = Dimensions.get('window');
const styles = require('../styles');

// var zoom = 1;

module.exports = React.createClass({
  getInitialState() {
    return {
      active: false,
      cameraPermission: 'undetermined',
      microphonePermission: 'undetermined'
    }
  },
  componentDidMount() {
    Permissions.checkMultiplePermissions(['camera', 'microphone']).then(resp => {
      this.setState({ 
        cameraPermission: resp.camera,
        microphonePermission: resp.microphone,
      })
      if (this.state.cameraPermission === 'undetermined' || this.state.microphonePermission === 'undetermined') {
        Alert.alert(
          'StreamChain would like access to your camera and microphone',
          'We use these to enable the core video streaming functionality of the app. Without these permissions, you will be unable to upload content.',
          [
            {text: 'Not now', style: 'cancel'},
            this.state.cameraPermission === 'undetermined' || this.state.microphonePermission === 'undetermined' ?
              {text: 'Okay', onPress: this._requestPermission}
              : {text: 'Open Settings', onPress: Permissions.openSettings} 
          ]
        )
      }
    })
  },
  _requestPermission() {
    if (this.state.cameraPermission === 'undetermined') {
      Permissions.requestPermission('camera').then(resp => this.setState({cameraPermission: resp}));
    } else if (this.state.microphonePermission === 'undetermined') {
      Permissions.requestPermission('microphone').then(resp => this.setState({microphonePermission: resp}))
    }
  },
  takeVideo() {
    if (this.state.active) return
    console.log('starting')
    this.setState({active: true})
    this.camera.capture().then(data => {
      this.setState({active: false})
      Alert.alert('data captured',`${data.path} : ${data.size}`)
    });
  },
  stopVideo() {
    if (!this.state.active) return
    console.log('ending')
    this.camera.stopCapture()
  },
  render() {
    return (
      <View style={styles.container} >
        <StatusBar barStyle="light-content" />
        <Camera 
          onFocusChanged={(e) => {console.log('focusChanged', e.nativeEvent)}} 
          defaultOnFocusComponent={true}
          onZoomChanged={(e) => {console.log('zoomChanged', e.nativeEvent)}}
          style={styles.camera}
          ref={cam => {this.camera = cam;}}
          aspect={Camera.constants.Aspect.fill}
          captureMode={Camera.constants.CaptureMode.video}
          captureAudio={true}
          captureTarget={Camera.constants.CaptureTarget.temp}
          captureQuality={Camera.constants.CaptureQuality.medium}>
          <View style={[styles.secondaryStreamButton,  {borderColor: this.state.active ? '#eb3c00' : '#e2e2e2'}]} />
          <TouchableOpacity 
            onPressIn={this.takeVideo} 
            onPressOut={this.stopVideo} 
            style={[styles.streamButton, {backgroundColor: this.state.active ? '#eb3c00' : '#e2e2e2'}]} 
            pressRetentionOffset={{top: height, left: width/2, bottom: 40, right: width/2}}/>
        </Camera>
        <NavArrow screen={"Data"} arguments={{}} side={'right'}/>
      </View>
    );
  },
})