const express = require("express");
const handle = require("../../middleware/handle");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const upload = require("../../services/uploading")();
const {
  uploadImage,
  deleteImage,
  deletePublic,
} = require("../../services/cloudinary");
const { User } = require("../../models/user");
const { Blog, validate } = require("../../models/blog");
const { transporter } = require("../../services/mail");
const validateObjectId = require("../../middleware/validateObjectId");
const renderEmail = require("../../services/renderEmail");
const config = require("config");
const Router = express.Router();
Router.get(
  "/",
  handle(async (req, res) => {
    const blogs = await Blog.find();
    if (!blogs) return res.status(400).send("There is no blogs right now.");
    res.send(blogs);
  })
);
Router.get(
  "/:id",
  handle(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(400).send("The blog with the given id");
    res.send(blog);
  })
);
Router.post(
  "/",
  [auth, admin],
  upload.single("image"),
  handle(async (req, res) => {
    if (!req.file) return res.status(400).send(`Blog's image is required`);
    let blog = {
      blog: req.body.blog,
      date: Date.now(),
    };
    const { error } = validate(blog);
    if (error) return res.status(400).send(error.details[0].message);
    const result = await uploadImage(req.file.path);
    if (result && result.url && result.public_id) {
      let newBlog = new Blog({
        blog: req.body.blog,
        date: Date(Date.now()),
        image: result,
      });
      let users = await User.find({}).select("email");
      let emails = [];
      users.forEach((item) => {
        emails.push(item.email);
      });
      newBlog = await newBlog.save();
      if (newBlog.errors) return res.status(400).send(newBlog.errors);
      await transporter.sendMail({
        from: config.get("Mail_UserName"),
        to: emails,
        subject: "Kar Arabia News",
        html: renderEmail(newBlog.image.url, newBlog.blog),
      });
      res.send("done");
    }
  })
);

Router.put(
  "/:id",
  validateObjectId,
  [auth, admin],
  upload.single("image"),
  handle(async (req, res) => {
    let blog = await Blog.findById(req.params.id);
    if (!blog)
      return res.status(400).send("The Blog with the given id was not found.");
    if (!req.file && !req.body.image)
      return res.status(400).send(`Blog's image is required`);
    const { error } = validate({
      blog: req.body.blog,
      date: blog.date,
    });
    if (error) return res.status(400).send(error.details[0].message);
    let image = {};
    if (req.file) {
      if (blog.image.public_id) await deleteImage(blog.image.public_id);
      let result = await uploadImage(req.file.path);
      if (result.url && result.public_id) image = result;
      else image = blog.image;
    } else image = blog.image;
    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { blog: req.body.blog, date: blog.date, image: image },
      { new: true }
    );
    deletePublic();
    res.send(blog);
  })
);
Router.delete(
  "/:id",
  [auth, admin],
  validateObjectId,
  handle(async (req, res) => {
    let result = await Blog.findById(req.params.id);
    if (!result)
      return res.status(400).send("The blog with the given id was not found");
    await deleteImage(result.image.public_id);
    result = await Blog.findByIdAndDelete(req.params.id);
    res.send(result);
  })
);
Router.get(
  "/:sortedBy/:limit",
  handle(async (req, res) => {
    const blogs = await Blog.find()
      .sort(req.params.sortedBy)
      .limit(parseInt(req.params.limit) > 0 && parseInt(req.params.limit));
    if (!blogs)
      return res.status(400).send("The requested blogs was not found");
    res.send(blogs);
  })
);
module.exports = Router;
