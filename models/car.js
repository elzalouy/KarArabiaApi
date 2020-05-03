const mongoose = require("mongoose");
const Joi = require("joi");
const imagesSchema = new mongoose.Schema({ url: Object, public_id: Object });
const item = new mongoose.Schema({
  key: { type: String, minlength: 2, maxlength: 25 },
  value: { type: String, minlength: 2, maxlength: 25 },
});
const feature = new mongoose.Schema({
  title: { type: String, minlength: 2, maxlength: 25 },
  items: { type: [item], minlength: 2, maxlength: 10 },
});
const CarSchema = mongoose.model(
  "Cars",
  new mongoose.Schema({
    name: { type: String, minlength: 3, maxlength: 64, required: true },
    short_desc: { type: String, minlength: 10, maxlength: 256, required: true },
    model: { type: String, minlength: 1, maxlength: 128, required: true },
    kilometers: { type: String, minlength: 1, maxlength: 128, required: true },
    body_type: { type: String, minlength: 1, maxlength: 128, required: true },
    transmission: { type: String, minlength: 1, max: 128 },
    color: { type: String, minlength: 1, maxlength: 128 },
    doors: { type: String, minlength: 1, maxlength: 128 },
    fuel_type: { type: String, minlength: 1, maxlength: 128 },
    speed: { type: String, minlength: 1, maxlength: 64, required: true },
    status: { type: String, minlength: 1, maxlength: 128 },
    price: { type: Number, required: true },
    extra_features: { type: [feature], min: 1, max: 10 },
    images: { type: [imagesSchema], min: 1, max: 6 },
    date: { type: Date, required: true },
  })
);
function validateKeyValue(data) {
  let schema = {
    key: Joi.string().min(2).max(25).required(),
    value: Joi.string().min(2).max(25).required(),
  };
  return Joi.validate(data, schema);
}

function validateFeature(data) {
  const schema = {
    title: Joi.string().min(2).max(25).required(),
    items: Joi.array().min(1).max(10).required(),
  };
  return Joi.validate(data, schema);
}

function ValidateCarSchema(data) {
  let schema = {
    name: Joi.string().required().min(3).max(64),
    short_desc: Joi.string().required().min(10).max(256),
    model: Joi.string().required().min(1).max(128),
    kilometers: Joi.string().min(1).max(128).required(),
    body_type: Joi.string().min(1).max(128).required(),
    transmission: Joi.string().min(1).max(128).required(),
    color: Joi.string().min(1).max(128).required(),
    doors: Joi.string().min(1).max(128),
    fuel_type: Joi.string().min(1).max(128),
    status: Joi.string().min(1).max(128),
    extra_features: Joi.array().min(1).max(10),
    price: Joi.number().required(),
    speed: Joi.string().min(1).max(64).required(),
  };
  return Joi.validate(data, schema);
}
function validateEditCar(data) {
  const schema = {
    name: Joi.string().required().min(3).max(64),
    short_desc: Joi.string().required().min(10).max(256),
    model: Joi.string().required().min(1).max(128),
    kilometers: Joi.string().min(1).max(128).required(),
    body_type: Joi.string().min(1).max(128).required(),
    transmission: Joi.string().min(1).max(128).required(),
    color: Joi.string().min(1).max(128).required(),
    doors: Joi.string().min(1).max(128),
    fuel_type: Joi.string().min(1).max(128),
    status: Joi.string().min(1).max(128),
    extra_features: Joi.array().min(1).max(10),
    price: Joi.number().required(),
    speed: Joi.string().min(1).max(64).required(),
    images: Joi.array().required().max(6),
  };
  return Joi.validate(data, schema);
}
module.exports = {
  Cars: CarSchema,
  validateCar: ValidateCarSchema,
  validateKeyValue: validateKeyValue,
  validateFeature: validateFeature,
  validateEditCar: validateEditCar,
};
