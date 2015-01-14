
function createRepeatArray(value, times) {
  var array = [];
  for (var i = 0; i < times; ++i) {
    array.push(value);
  }
  return array;
}

module.exports = {
  createRepeatArray: createRepeatArray
};
