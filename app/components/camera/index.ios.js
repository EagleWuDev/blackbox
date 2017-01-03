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

const {height, width} = Dimensions.get('window');
const styles = require('../styles');

// var zoom = 1;

module.exports = React.createClass({
  getInitialState() {
    return {
      muted: false,
      started: false,
      text: '...',
      focus:true,
      zoom: 1,
      cameraPermission: 'undetermined',
      microphonePermission: 'undetermined',
      rtmpURL: ''
    }
  },
  componentWillMount() {
    this._checkCameraAndMic();
  },
  componentDidMount() {
    if ((this.state.cameraPermission || this.state.microphonePermission) !== 'denied' || 
        (this.state.cameraPermission || this.state.microphonePermission) !== 'undetermined')
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
  },
  _requestPermission() {
    if (this.state.cameraPermission === 'denied' || this.state.cameraPermission === 'undetermined') {
      Permissions.requestPermission('camera').then(resp => this.setState({cameraPermission: resp}));
    }
    if (this.state.microphonePermission === 'denied' || this.state.microphonePermission === 'undetermined') {
      Permissions.requestPermission('microphone').then(resp => this.setState({microphonePermission: resp}))
    }
  },
  _checkCameraAndMic() {
    Permissions.checkMultiplePermissions(['camera', 'microphone'])
    .then(resp => {
      this.setState({ 
        cameraPermission: resp.camera,
        microphonePermission: resp.microphone,
      })
    });
  },
  toggleStream() {

    // if (this.state.started) { // reset rtmp token and stop stream
    //   this.setState({
    //     started: false,
    //     rtmpTOKEN: ''
    //   })
    // } else { // get rtmp token and start stream
    //   fetch('http://47.20.7.26:29061/token').then(resp => resp.json()).then(data => {
    //     this.setState({
    //       rtmpTOKEN: data.token,
    //       started: true
    //     })
    //   }).catch(err => Alert.alert('Network Request Failed'))
    // }
  },
          // rtmpURL={"rtmp://pili-publish.pilitest.qiniucdn.com/pilitest/demo_test?key=6eeee8a82246636e"}

  takeVideo() {
    this.refs.camera.capture(data => Alert.alert('data captured',Object.keys(data).join('  ')));
  },
  render() {
    return (
      <View style={styles.container} >
        <StatusBar barStyle="light-content" />
        <Camera 
          ref={cam => this.camera = cam;}
          aspect={Camera.constants.Aspect.fill}
          captureMode={Camera.constants.CaptureMode.video}
          captureAudio={true}
          captureTarget={Camera.constants.CaptureTarget.disk}
          captureQuality={Camera.constants.CaptureQuality.medium}>
          <TouchableOpacity 
            onLongPress={this.takeVideo.bind(this)} 
            onPressOut={this.refs.camera.stopCapture} 
            style={styles.streamButton} 
            underlayColor={'#eb3c00'}/> 
        </Camera>
        {false && <View style={styles.streamBar}>
          <Text style={{color: '#eee',textAlign: 'center'}}>{this.state.text}</Text>
          <View style={{flexDirection: 'row'}}>
            <TouchableHighlight onPress={() => this.zoom(1)}>
              <Text style={styles.zoom}>zoom+</Text>
            </TouchableHighlight>
            <TouchableHighlight onPress={() => this.zoom(-1)}>
              <Text style={[styles.zoom, {textAlign: 'right'}]}>zoom-</Text>
            </TouchableHighlight>
          </View>
        </View>}
      </View>
    );
  },

  zoom(increment) {
    zoom = zoom + increment;
    if (zoom <= 0) zoom = 1;
    console.log(zoom)
    this.setState({zoom})
  },

  onState() {
    this.setState({text: "loading"});
  },

  start() {
    this.setState({ started: !this.state.started });
  },

  mute() {
    this.setState({ muted: !this.state.muted });
  }
})