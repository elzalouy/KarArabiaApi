const mongoose = require("mongoose");
const Joi = require("joi");

const redisImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
});

const redisItemSchema = new mongoose.Schema({
  title: { type: String, minlength: 2, maxlength: 64 },
  link: { type: String },
  image: {
    type: redisImageSchema,
  },
});

const redisImagesSchema = mongoose.model(
  "redisImages",
  new mongoose.Schema({
    key: { type: String, required: true, unique: true, min: 2, max: 256 },
    items: {
      type: [redisItemSchema],
      minlength: 0,
      maxlength: 10,
      required: true,
    },
  })
);
function validateRedis(redis) {
  const schema = {
    key: Joi.string().required(),
    items: Joi.array().required().min(0).max(10),
  };
  return Joi.validate(redis, schema);
}
function validateRedisItem(data) {
  const itemSchema = {
    image: Joi.object().allow(null),
    title: Joi.string().min(3).max(64),
    link: Joi.string().allow([null, ""]),
  };
  return Joi.validate(data, itemSchema);
}
function validateUpdateSubItemImage(data) {
  const schema = {
    redisId: Joi.string().required(),
    itemId: Joi.string().required(),
  };
  return Joi.validate(data, schema);
}
module.exports = {
  redisImagesSchema: redisImagesSchema,
  validateRedisItem: validateRedisItem,
  validateUpdateSubItemImage: validateUpdateSubItemImage,
  validateRedis: validateRedis,
};
