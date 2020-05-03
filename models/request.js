const mongoose = require("mongoose");
const joi = require("joi");

const Requests = mongoose.model(
  "requests",
  new mongoose.Schema({
    car_id: { type: String, required: true },
    user_id: { type: String, required: true },
    date: { type: Date, required: true },
  })
);

function validateRequest(data) {
  let schema = {
    car_id: joi.string().required(),
    user_id: joi.string().required(),
    date: joi.date().required(),
  };
  return joi.validate(data, schema);
}

module.exports = {
  validateRequest: validateRequest,
  Requests: Requests,
};
