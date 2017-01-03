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
    width: 30,
    height: 30,
    left: (width/2)-15,
    borderRadius: 15
  }
})