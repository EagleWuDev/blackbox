import { StyleSheet, Dimensions } from 'react-native';

const {height, width} = Dimensions.get('window');

module.exports = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2e2e2e',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#eee',
    marginBottom: 5,
  },
  streamBar: {
    position:'absolute',
    left: 50,
    top: 50,
    width: width-100,
    flexDirection: 'column'
  },
  zoom: {
    height: 100,
    width: (width-100)/2,
    color:'#eee'
  },
  streamButton: {
    position: 'absolute',
    bottom: 25,
    width: 50,
    height: 50,
    left: (width/2)-25,
    borderRadius: 25,
  },
  secondaryStreamButton: {
    position: 'absolute',
    bottom: 21,
    width: 58,
    height: 58,
    left: (width/2)-29,
    borderRadius: 29,
    borderWidth: 2
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: height,
    width: width
  }
})