import React from 'react';
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

// from toolbox
import { flattenNum, toRevolutions } from '../toolbox/functions'
import NavArrow from '../toolbox/NavArrow';

const {height, width} = Dimensions.get('window');
const styles = require('../styles');

var alerted = 1;

// function flattenNum(float) { return Math.floor(float*10000)/10000; };
// function toRevolutions(gyroDataRAW) { return gyroDataRAW/Math.PI }

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
    var that = this;
    // accelerometer listener 
    Accelerometer.setAccelerometerUpdateInterval(0.1);
    DeviceEventEmitter.addListener('AccelerationData', function (data) {
      that.setState({
        accelerationX: data.acceleration.x,
        accelerationY: data.acceleration.y,
        accelerationZ: data.acceleration.z
      });
    });
    // gyroscope listener
    Gyroscope.setGyroUpdateInterval(0.1);
    DeviceEventEmitter.addListener('GyroData', function (data) {
      that.setState({
        gyroscopeX: data.rotationRate.x,
        gyroscopeY: data.rotationRate.y,
        gyroscopeZ: data.rotationRate.z
      });
    });
    // magetometer listener
    Magnetometer.setMagnetometerUpdateInterval(0.1);
    DeviceEventEmitter.addListener('MagnetometerData', function (data) {
      that.setState({
        magnetometerX: data.magneticField.x,
        magnetometerY: data.magneticField.y,
        magnetometerZ: data.magneticField.z
      });
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
          data={[`x: ${flattenNum(this.state.accelerationX)}`, 
                 `y: ${flattenNum(this.state.accelerationY)}`, 
                 `z: ${flattenNum(this.state.accelerationZ)}`]}/>
        <DataBox 
          title={'Gyroscope Data (rps)'} 
          data={[`x: ${flattenNum(toRevolutions(this.state.gyroscopeX))}`, 
                 `y: ${flattenNum(toRevolutions(this.state.gyroscopeY))}`, 
                 `z: ${flattenNum(toRevolutions(this.state.gyroscopeZ))}`]}/>
        <DataBox 
          title={'Magnetometer Data (µTesla)'} 
          data={[`x: ${flattenNum(this.state.magnetometerX)}`, 
                 `y: ${flattenNum(this.state.magnetometerX)}`, 
                 `z: ${flattenNum(this.state.magnetometerX)}`]}/>
        <View style={[styles.secondaryStreamButton,  {borderColor: this.state.listening ? '#eb3c00' : '#e2e2e2'}]} />
        <TouchableOpacity onPress={this.toggleListening} 
          style={[styles.streamButton, {backgroundColor: this.state.listening ? '#eb3c00' : '#e2e2e2'}]} />
        <NavArrow screen={"pop"} arguments={{}} side={'left'}/>
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