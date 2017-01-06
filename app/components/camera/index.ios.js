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
  TouchableOpacity,
  DeviceEventEmitter
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Camera from 'react-native-camera';
import {
  Accelerometer,
  Gyroscope,
  Magnetometer,
  DeviceAngles
} from 'NativeModules';

const Permissions = require('react-native-permissions');

import { NavArrow } from '../toolbox/components';

const {height, width} = Dimensions.get('window');
const styles = require('../styles');
const uploadUri = 'https://c185cbf1.ngrok.io/';

var beforeIncident = {}; // rotating object to store motion data before accident
var incident = {}; // rotating object to store motion data after accident

// constants defining data collection
const DATA_INTERVAL = 0.1 // data event firing interval (in seconds)
const MAX_COUNT = 10*5; // max number of entries stored in beforeIncident object
const MAX_ACC = 8; // acceleration value (in g's) that triggers video recording and a collision event
const VIDEO_LENGTH = 5000; // length of video recorded for a collision event (in milliseconds)

module.exports = React.createClass({
  getInitialState() {
    return {
      // permissions
      cameraPermission: 'undetermined',
      microphonePermission: 'undetermined',
      locationPermission: 'undetermined',
      // pre collision indices
      accelerometerIndex: 0,
      gyroIndex: 0,
      deviceIndex: 0,
      // post collision indices
      accelerometerIndexPost: 0,
      gyroIndexPost: 0,
      deviceIndexPost: 0,
      // boolean toggles
      active: false,
      watching: false,
      collision: false,
      // collision data
      collisionStart: ''
    }
  },
  componentDidMount() {
    this.setUpDeviceMonitors();
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
    var body = new FormData();
    body.append('carId', 3);
    body.append('extras', 'All your base are belong to us');
    body.append('video', video);
    xhr.open('POST', `${uploadUri}record_finished`);
    xhr.onload = function() {
      if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) 
        Alert.alert('File Uploaded successfully', 'Congratulations!');
      else if (xhr.readyState == XMLHttpRequest.DONE) 
        Alert.alert('File failed to upload', `Server responded with status ${xhr.status}`);
    }
    xhr.send(body);
  },
  // startRecordingData() {},
  toggleWatch() { // toggles listeners (accelerometer)
    if (!this.state.watching) {
      // start all listeners
      console.log('watch started')
      this.setState({watching: true});
      Accelerometer.startAccelerometerUpdates(); 
      DeviceAngles.startMotionUpdates();
      Gyroscope.startGyroUpdates();
    } else {
      // stop all listeners
      this.setState({
        watching: false,
        accelerometerIndex: 0,
        gyroIndex: 0,
        deviceIndex: 0
      });
      Accelerometer.stopAccelerometerUpdates();
      DeviceAngles.stopMotionUpdates();
      Gyroscope.stopGyroUpdates();
      beforeIncident = {};

    }
  },
  setUpDeviceMonitors() { // refactor this, it is offensive
    var that = this;
    // accelerometer listener 
    Accelerometer.setAccelerometerUpdateInterval(DATA_INTERVAL);
    DeviceEventEmitter.addListener('AccelerationData', function (data) {
      if (!that.state.collision) { // not currently in a collision => save data in rotating object
        beforeIncident[that.state.accelerometerIndex] = beforeIncident[that.state.accelerometerIndex] || {};
        beforeIncident[that.state.accelerometerIndex].acceleration = {
          x: data.acceleration.x,
          y: data.acceleration.y,
          z: data.acceleration.z
        };
        that.setState({accelerometerIndex: (that.state.accelerometerIndex+1)%MAX_COUNT});
      } else { // data post collision
        incident[that.state.accelerometerIndexPost] = incident[that.state.accelerometerIndexPost] || {};
        incident[that.state.accelerometerIndexPost].acceleration = {
          x: data.acceleration.x,
          y: data.acceleration.y,
          z: data.acceleration.z
        };
        that.setState({accelerometerIndexPost: that.state.accelerometerIndexPost+1});
      }

      // not currently in a collision and acceleration indicative of possible incident
      if (that.state.collision === false && (Math.abs(data.acceleration.x) > MAX_ACC || 
                                             Math.abs(data.acceleration.y) > MAX_ACC || 
                                             Math.abs(data.acceleration.z) > MAX_ACC)) {
        that.collisionProtocol()
      }
    });
    // gyroscope listener
    Gyroscope.setGyroUpdateInterval(DATA_INTERVAL);
    DeviceEventEmitter.addListener('GyroData', function (data) {
      if (!that.state.collision) { // not currently in a collision => save data in rotating object
        beforeIncident[that.state.gyroIndex] = beforeIncident[that.state.gyroIndex] || {};
        beforeIncident[that.state.gyroIndex].rotationRate = {
          x: data.rotationRate.x,
          y: data.rotationRate.y,
          z: data.rotationRate.z
        };
        that.setState({gyroIndex: (that.state.gyroIndex+1)%MAX_COUNT});
      } else { // data post collision
        incident[that.state.gyroIndexPost] = incident[that.state.gyroIndexPost] || {};
        incident[that.state.gyroIndexPost].rotationRate = {
          x: data.rotationRate.x,
          y: data.rotationRate.y,
          z: data.rotationRate.z
        };
        that.setState({gyroIndexPost: that.state.gyroIndexPost+1});
      }
    });
    // device attitude listener
    DeviceAngles.setDeviceMotionUpdateInterval(DATA_INTERVAL);
    DeviceEventEmitter.addListener('AnglesData', function (data) {
      if (!that.state.collision) { // not currently in a collision => save data in rotating object
        beforeIncident[that.state.deviceIndex] = beforeIncident[that.state.deviceIndex] || {};
        beforeIncident[that.state.deviceIndex].deviceAngles = {
          pitch: data.pitch,
          roll: data.roll,
          yaw: data.yaw
        };
        that.setState({deviceIndex: (that.state.deviceIndex+1)%MAX_COUNT});
      } else { // data post collision
        incident[that.state.deviceIndexPost] = incident[that.state.deviceIndexPost] || {};
        incident[that.state.deviceIndexPost].deviceAngles = {
          pitch: data.pitch,
          roll: data.roll,
          yaw: data.yaw
        };
        that.setState({deviceIndexPost: that.state.deviceIndexPost+1});
      }
    });
  },
  collisionProtocol() {
    this.setState({
      collision: true, 
      collisionStart: new Date(),
      accelerometerIndexPost: 0,
      gyroIndexPost: 0,
      deviceIndexPost: 0
    });
    Alert.alert('Collision Detected', 'We are have begun recording data on the incident');
    this.takeVideo();
    console.log('TRIGGER DATA');
    console.log(beforeIncident[this.state.accelerometerIndex-1]);
    setTimeout(() => {
      this.toggleWatch();
      this.stopVideo();
      console.log('INCIDENT DATA');
      console.log(incident);
    }, VIDEO_LENGTH); // stop recording 5 sec after start
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
            onPress={this.toggleWatch}
            style={[styles.streamButton, {backgroundColor: this.state.active ? '#eb3c00' : '#e2e2e2'}]} 
            pressRetentionOffset={{top: height, left: width/2, bottom: 40, right: width/2}}/>
        </Camera>
        <NavArrow screen={"Data"} arguments={{}} side={'right'}/>
      </View>
    );
  },
})
            // onPressIn={this.takeVideo} 
            // onPressOut={this.stopVideo} 