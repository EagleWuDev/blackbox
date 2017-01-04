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
import {
  Accelerometer,
  Gyroscope,
  Magnetometer
} from 'NativeModules';

const {height, width} = Dimensions.get('window');
const styles = require('../styles');

var zoom = 1;

function flattenNum(float) { return Math.floor(float*10000)/10000; };

module.exports = React.createClass({
  getInitialState() {
    return {
      accelerationX: 0,
      accelerationY: 0,
      accelerationZ: 0,
      gyroscopeX: 0,
      gyroscopeY: 0,
      gyroscopeZ: 0,
      magnetometerX: 0,
      magnetometerY: 0,
      magnetometerZ: 0,
      listening: false
    }
  },
  componentWillMount() {
    var that = this
    // accelerometer listener 
    Accelerometer.setAccelerometerUpdateInterval(0.1);
    DeviceEventEmitter.addListener('AccelerationData', function (data) {
      that.setState({
        accelerationX: flattenNum(data.acceleration.x),
        accelerationY: flattenNum(data.acceleration.y),
        accelerationZ: flattenNum(data.acceleration.z)
      })
    });
    // gyroscope listener
    Gyroscope.setGyroUpdateInterval(0.1);
    DeviceEventEmitter.addListener('GyroData', function (data) {
      that.setState({
        gyroscopeX: flattenNum(data.rotationRate.x),
        gyroscopeY: flattenNum(data.rotationRate.y),
        gyroscopeZ: flattenNum(data.rotationRate.z)
      })
    });
    // magetometer listener
    Magnetometer.setMagnetometerUpdateInterval(0.1);
    DeviceEventEmitter.addListener('MagnetometerData', function (data) {
      that.setState({
        magnetometerX: flattenNum(data.magneticField.x),
        magnetometerY: flattenNum(data.magneticField.y),
        magnetometerZ: flattenNum(data.magneticField.z)
      })
    });
  },
  toggleListening() {
    if (!this.state.listening) {
      // start all listeners
      this.setState({listening: true});
      Accelerometer.startAccelerometerUpdates(); 
      Gyroscope.startGyroUpdates();
      Magnetometer.startMagnetometerUpdates();
    } else {
      // stop all listeners
      this.setState({listening: false});
      Accelerometer.stopAccelerometerUpdates();
      Gyroscope.stopGyroUpdates();
      Magnetometer.stopMagnetometerUpdates();

    }
  },
  render() {
    return (
      <View style={styles.container} >
        <StatusBar barStyle="light-content" />
        <Text style={[styles.smallText, {fontSize: 25}]}>D A T A   F I E L D S</Text>
        <DataBox 
          title={'Accelerometer Data (G\'s)'} 
          data={[`x: ${this.state.accelerationX}`, 
                 `y: ${this.state.accelerationY}`, 
                 `z: ${this.state.accelerationZ}`]}/>
        <DataBox 
          title={'Gyroscope Data (radians)'} 
          data={[`x: ${this.state.gyroscopeX}`, 
                 `y: ${this.state.gyroscopeY}`, 
                 `z: ${this.state.gyroscopeZ}`]}/>
        <DataBox 
          title={'Magnetometer Data (µTesla)'} 
          data={[`x: ${this.state.magnetometerX}`, 
                 `y: ${this.state.magnetometerX}`, 
                 `z: ${this.state.magnetometerX}`]}/>
        <View style={[styles.secondaryStreamButton,  {borderColor: this.state.listening ? '#eb3c00' : '#e2e2e2'}]} />
        <TouchableOpacity onPress={this.toggleListening} 
          style={[styles.streamButton, {backgroundColor: this.state.listening ? '#eb3c00' : '#e2e2e2'}]} />
      </View>
    );
  },

})

var DataBox = React.createClass({
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