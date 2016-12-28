import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Pili, {
    Streaming,
    Player,
    StreamingConst
} from 'react-native-pili';

const {height, width} = Dimensions.get('window');
const styles = require('../styles');

module.exports = React.createClass({
  getInitialState() {
    return {
      muted: false,
      started: true,
      text: '...',
      focus:true,
      zoom: 1
    }
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
    if (zoom < 0) zoom = 1;
    this.setState(zoom)
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