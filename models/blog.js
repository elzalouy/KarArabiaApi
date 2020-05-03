const mongoose = require("mongoose");
const joi = require("joi");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true }
});
const blog = mongoose.model(
  "blog",
  new mongoose.Schema({
    blog: { type: String, minlength: 20, required: true },
    image: { type: imageSchema, required: true },
    date: { type: String, required: true }
  })
);
function validateBlog(data) {
  const shcema = {
    blog: joi.string().required(),
    date: joi.date().required()
  };
  return joi.validate(data, shcema);
}
module.exports = {
  Blog: blog,
  validate: validateBlog
};
