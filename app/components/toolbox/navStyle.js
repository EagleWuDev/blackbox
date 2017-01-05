import { StyleSheet, Dimensions } from 'react-native';

const {height, width} = Dimensions.get('window');

module.exports = StyleSheet.create({
  navArrowBox: {
    position: 'absolute',
    top: height/2 - 14,
    left: 20,
    width: 15,
    height: 20
  },
  upperNavArrow: {
    marginBottom: -3,
    transform: [
      { rotate: '45deg' }
    ]
  },
  navArrow: {
    width: StyleSheet.hairlineWidth,
    height: 10,
    backgroundColor: '#fff',
    transform: [
      { rotate: '-45deg' }
    ]
  },
  right: {
    left: width-35,
    right: 20,
    transform: [
      { rotate: '180deg' }
    ]
  },
  left: {}
})