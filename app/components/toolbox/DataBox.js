import React from 'react';
import {
  View,
  Text,
} from 'react-native';

var styles = require('../styles');

module.exports = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
    title: React.PropTypes.string
  },
  render() {
    return (
      <View style={styles.dataBox}>
        <Text style={styles.smallText}>{this.props.title}</Text>
        <View>
          {this.props.data.map((elt,i) => <Text style={[styles.smallText, {textAlign: 'left'}]} key={i}>{elt}</Text>)}
        </View>
      </View>
    )
  }
})