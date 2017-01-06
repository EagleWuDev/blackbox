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

import { NavArrow } from '../toolbox/components';

const {height, width} = Dimensions.get('window');
const styles = require('../styles');

module.exports = React.createClass({
  getInitialState() {
    return {
      active: false,
      cameraPermission: 'undetermined',
      microphonePermission: 'undetermined',
      locationPermission: 'undetermined'
    }
  },
  componentDidMount() {
    Permissions.checkMultiplePermissions(['camera', 'microphone', 'location']).then(resp => {
      this.setState({ 
        cameraPermission: resp.camera,
        microphonePermission: resp.microphone,
        locationPermission: resp.location
      })
      if (this.state.cameraPermission === 'undetermined' || 
          this.state.microphonePermission === 'undetermined' || 
          this.state.locationPermission === 'undetermined') {
        Alert.alert(
          'StreamChain would like access to your camera, microphone, and location',
          'We use these to enable the core video streaming functionality of the app and \
           enhance accuracy of collision data. Without these permissions, you will be \
           unable to upload content.',
          [
            {text: 'Not now', style: 'cancel'},
            this.state.cameraPermission === 'undetermined' || 
            this.state.microphonePermission === 'undetermined' || 
            this.state.locationPermission === 'undetermined' ?
              {text: 'Okay', onPress: this._requestPermission}
              : {text: 'Open Settings', onPress: Permissions.openSettings} 
          ]
        )
      }
    })
  },
  _requestPermission() {
    if (this.state.cameraPermission === 'undetermined') 
      Permissions.requestPermission('camera').then(resp => this.setState({cameraPermission: resp}));
    if (this.state.microphonePermission === 'undetermined') 
      Permissions.requestPermission('microphone').then(resp => this.setState({microphonePermission: resp}));
    if (this.state.locationPermission === 'undetermined') 
      Permissions.requestPermission('location').then(resp => this.setState({locationPermission: resp}));
  },
  takeVideo() {
    if (this.state.active) return
    console.log('starting')
    this.setState({active: true})
    this.camera.capture().then(data => {
      this.setState({active: false})
      this.uploadFile(data)
      //Alert.alert('data captured',`${data.path.split('/').slice(-1)} : ${data.size}`)
    });
  },
  stopVideo() {
    if (!this.state.active) return
    console.log('ending')
    this.camera.stopCapture()
  },
  uploadFile(data) {
    var xhr = new XMLHttpRequest()

    var video = {
      uri: `file://${data.path}`,
      type: 'video/quicktime',
      name: data.path.split('/').slice(-1)[0]
    }
    console.log(video)
    var body = new FormData();
    body.append('carId', 3);
    body.append('extras', 'All your base are belong to us');
    body.append('video', video);
    xhr.open('POST', 'https://8b4bafcf.ngrok.io/record_finished');
    xhr.onload = function() {
      if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        Alert.alert('File Uploaded successfully', 'Congratulations!');
      } else if (xhr.readyState == XMLHttpRequest.DONE) {
        // alert(Object.keys(xhr).join(' '))
        Alert.alert('File failed to upload', `Server responded with status ${xhr.status}`);
      }
    }
    xhr.send(body);
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