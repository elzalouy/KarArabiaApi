const mongoose = require("mongoose");
const Joi = require("joi");

const contactModel = mongoose.model(
  "contacts",
  new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    email: { type: String, required: true },
    subject: { type: String, required: true, min: 2, maxlength: 64 },
    message: { type: String, required: true, minlength: 10 },
    date: { type: Date, required: true },
  })
);

function validateContact(contact) {
  const Schema = {
    name: Joi.string().required().min(2),
    email: Joi.string().required(),
    subject: Joi.string().required(),
    message: Joi.string().required().min(10),
    date: Joi.date().required(),
  };
  return Joi.validate(contact, Schema);
}
module.exports = {
  contactModel: contactModel,
  validateContact: validateContact,
};
