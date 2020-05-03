const mongoose = require("mongoose");
const Joi = require("joi");
const redis = mongoose.model(
  "redis",
  new mongoose.Schema({
    key: { type: String, required: true, unique: true, minlength: 2 },
    value: { type: String, required: true, minlength: 2 },
  })
);
function validateRedisItem(value) {
  const schema = {
    key: Joi.string().required().min(2),
    value: Joi.string().required().min(2),
  };
  return Joi.validate(value, schema);
}
module.exports = {
  Redis: redis,
  validateRedisItem: validateRedisItem,
};
