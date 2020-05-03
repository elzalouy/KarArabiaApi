const mongoose = require("mongoose");
module.exports = function (req, res, next) {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid ID.");
  next();
};
