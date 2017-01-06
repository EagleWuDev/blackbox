import React from 'react';
import {
  View,
  TouchableOpacity
} from 'react-native';
import { Actions } from 'react-native-router-flux';

var styles = require('./navStyle');

module.exports = React.createClass({
  propTypes: {
    side: React.PropTypes.string
  },
  render() {
    return (
      <TouchableOpacity 
        hitSlop={{top: 10, left: 15, bottom: 10, right: 5}}
        onPress={this.props.action} 
        style={[styles.navArrowBox, styles[this.props.side]]}>
        <View style={[styles.navArrow, styles.upperNavArrow]}/>
        <View style={styles.navArrow}/>
      </TouchableOpacity>
    )
  }
})