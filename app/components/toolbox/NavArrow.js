import React, { Component } from 'react';
import {
  Text,
  View,
  Dimensions,
  Alert,
  StatusBar,
  DeviceEventEmitter,
  TouchableOpacity
} from 'react-native';
import { Actions } from 'react-native-router-flux';

var styles = require('./navStyle');

module.exports = React.createClass({
  propTypes: {
    screen: React.PropTypes.string,
    arguments: React.PropTypes.object,
    side: React.PropTypes.string
  },
  render() {
    return (
      <TouchableOpacity 
        hitSlop={{top: 10, left: 15, bottom: 10, right: 5}}
        onPress={() => Actions[this.props.screen](this.props.arguments)} 
        style={[styles.navArrowBox, styles[this.props.side]]}>
        <View style={[styles.navArrow, styles.upperNavArrow]}/>
        <View style={styles.navArrow}/>
      </TouchableOpacity>
    )
  }
})