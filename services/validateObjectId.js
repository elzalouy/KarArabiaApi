const mongoose = require("mongoose");
function validateId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  return true;
}

module.exports = validateId;
