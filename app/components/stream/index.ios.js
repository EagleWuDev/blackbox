import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  Alert
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Pili, {
    Streaming,
    Player,
    StreamingConst
} from 'react-native-pili';

const Permissions = require('react-native-permissions');

const {height, width} = Dimensions.get('window');
const styles = require('../styles');

var zoom = 1;

module.exports = React.createClass({
  getInitialState() {
    return {
      muted: false,
      started: true,
      text: '...',
      focus:true,
      zoom: 1,
      cameraPermission: 'undetermined',
      microphonePermission: 'undetermined'
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
  render() {
    return (
      <View style={styles.container}>
        <Streaming
          rtmpURL={"rtmp://pili-publish.pilitest.qiniucdn.com/pilitest/demo_test?key=6eeee8a82246636e"}
          style={{
            height:height,
            width:width,
          }}
          zoom={this.state.zoom}
          focus={this.state.focus}
          profile={{
            video:{
              fps:30,
              bps:1000 * 1024,
              maxFrameInterval:48
            },
            audio:{
              rate:44100,
              bitrate:96 * 1024
            },
            encodingSize:StreamingConst.encodingSize._480
          }}
          started={this.state.started}
          onReady={()=>this.setState({text: "onReady"})} //onReady event
          onConnecting={()=>this.setState({text: "onConnecting"})} //onConnecting event
          onStreaming={()=>this.setState({text: "onStreaming"})} //onStreaming event
          onShutdown={()=>this.setState({text: "onShutdown"})} //onShutdown event
          onIOError={()=>this.setState({text: "onIOError"})} //onIOError event
          onDisconnected={()=>this.setState({text: "onDisconnected"})} //onDisconnected event
        />
        <View style={{position:'absolute',left:50,top:50,width:200,height:200}}>
          <Text>{this.state.text}</Text>
          <TouchableHighlight onPress={() => this.zoom(1)}>
            <Text style={{height:100,width:100}}>+</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => this.zoom(-1)}>
            <Text style={{height:100,width:100}}>-</Text>
          </TouchableHighlight>
        </View>
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