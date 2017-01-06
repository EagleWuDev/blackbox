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
import { Actions, ActionConst } from 'react-native-router-flux';
import {
  Accelerometer,
  Gyroscope,
  Magnetometer,
  DeviceAngles
} from 'NativeModules';

// from toolbox
import { flattenNum, toRevolutions } from '../toolbox/functions'
import { DataBox, NavArrow } from '../toolbox/components'

const {height, width} = Dimensions.get('window');
const styles = require('../styles');

var alerted = 1;

module.exports = React.createClass({
  getInitialState() {
    return {
      accelerationX: 0,
      accelerationY: 0,
      accelerationZ: 0,
      maxAccelerationX: 0,
      maxAccelerationY: 0,
      maxAccelerationZ: 0,
      gyroscopeX: 0,
      gyroscopeY: 0,
      gyroscopeZ: 0,
      pitch: 0,
      roll: 0,
      yaw: 0,
      listening: false
    }
  },
  componentWillMount() {
    var that = this;
    // accelerometer listener 
    Accelerometer.setAccelerometerUpdateInterval(0.1);
    this.accelerationListener = DeviceEventEmitter.addListener('AccelerationData', function (data) {
      that.setState({
        accelerationX: data.acceleration.x,
        accelerationY: data.acceleration.y,
        accelerationZ: data.acceleration.z,
        maxAccelerationX: Math.abs(data.acceleration.x) > that.state.maxAccelerationX ? Math.abs(data.acceleration.x) : that.state.maxAccelerationX,
        maxAccelerationY: Math.abs(data.acceleration.y) > that.state.maxAccelerationY ? Math.abs(data.acceleration.y) : that.state.maxAccelerationY,
        maxAccelerationZ: Math.abs(data.acceleration.z) > that.state.maxAccelerationZ ? Math.abs(data.acceleration.z) : that.state.maxAccelerationZ,
      });
    });
    // gyroscope listener
    Gyroscope.setGyroUpdateInterval(0.1);
    this.rotationListener = DeviceEventEmitter.addListener('GyroData', function (data) {
      that.setState({
        gyroscopeX: data.rotationRate.x,
        gyroscopeY: data.rotationRate.y,
        gyroscopeZ: data.rotationRate.z
      });
    });
    // device attitude listener
    DeviceAngles.setDeviceMotionUpdateInterval(0.1);
    this.deviceListener = DeviceEventEmitter.addListener('AnglesData', function (data) {
      that.setState({
        pitch: data.pitch,
        roll: data.roll,
        yaw: data.yaw
      });
    });
    // set up geolocation
    // navigator.geolocation.watchPosition();
  },
  toggleListening() {
    if (!this.state.listening) {
      // start all listeners
      this.setState({listening: true});
      Accelerometer.startAccelerometerUpdates(); 
      DeviceAngles.startMotionUpdates();
      Gyroscope.startGyroUpdates();
    } else {
      // stop all listeners
      this.setState({listening: false});
      Accelerometer.stopAccelerometerUpdates();
      DeviceAngles.stopMotionUpdates();
      Gyroscope.stopGyroUpdates();
    }
  },
  toggleIntervals() {
    Accelerometer.setAccelerometerUpdateInterval(1);
    Gyroscope.setGyroUpdateInterval(1);
    DeviceAngles.setDeviceMotionUpdateInterval(1);    
  },
  componentWillUnmount() {
    if (this.state.listening) this.toggleListening();
    this.accelerationListener.remove();
    this.rotationListener.remove();
    this.deviceListener.remove();
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
          title={'Max Accelerometer Data (|G\'s|)'} 
          data={[`x: ${flattenNum(this.state.maxAccelerationX)}`, 
                 `y: ${flattenNum(this.state.maxAccelerationY)}`, 
                 `z: ${flattenNum(this.state.maxAccelerationZ)}`]}/>
        <DataBox 
          title={'Gyroscope Data (rps)'} 
          data={[`x: ${flattenNum(toRevolutions(this.state.gyroscopeX))}`, 
                 `y: ${flattenNum(toRevolutions(this.state.gyroscopeY))}`, 
                 `z: ${flattenNum(toRevolutions(this.state.gyroscopeZ))}`]}/>
        <DataBox 
          title={'Angles Data (degrees)'} 
          data={[`pitch: ${flattenNum(this.state.pitch)}`, 
                 `roll: ${flattenNum(this.state.roll)}`, 
                 `yaw: ${flattenNum(this.state.yaw)}`]}/>
        <View style={[styles.secondaryStreamButton,  {borderColor: this.state.listening ? '#eb3c00' : '#e2e2e2'}]} />
        <TouchableOpacity onPress={this.toggleListening} 
          style={[styles.streamButton, {backgroundColor: this.state.listening ? '#eb3c00' : '#e2e2e2'}]} />
        <NavArrow action={() => Actions.Camera({type: ActionConst.REPLACE})} side={'left'}/>
      </View>
    );
  }
})