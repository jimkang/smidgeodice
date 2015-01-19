var probable = require('probable');

var dividerTable = probable.createRangeTableFromDict({
  ' ⇒ ': 20,
  '⚡️': 1,
  ' ⟹ ': 1,
  ' ⇨ ': 1,
  ' ⇾ ': 1,
  ' ⇢ ': 1,
  ' ➔ ': 1,
  ' ➜ ': 1,
  ' ➙ ': 1,
  ' ➛ ': 1,
  ' ➝ ': 1,
  ' ➞ ': 1,
  ' ➢ ': 1,
  ' ➤ ': 1,
  ' ➪ ': 1,
  ' ➫ ': 1,
  ' ⟶ ': 1,
  ' ✧ ': 1,
  ' ▷ ': 1,
  ' ‣ ': 1,
  ' ▸ ': 1,
  ' ▹ ': 1,
  ' ► ': 1,
  ' ▻ ': 1,
  ' ✨ ': 1,
  ' 💥 ': 1,
  ' 💨 ': 1,
  ' 🎉 ': 1,
  ' 🎲 ': 1,
  ' 💨 ': 1
});

module.exports = {
  pickDivider: dividerTable.roll
};

