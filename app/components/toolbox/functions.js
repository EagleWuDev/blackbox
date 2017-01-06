module.exports = {
  flattenNum(float) { return Math.floor(float*10000)/10000; },
  toRevolutions(gyroDataRAW) { return gyroDataRAW/Math.PI; }
}