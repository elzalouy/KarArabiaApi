const express = require("express");
const handle = require("../../middleware/handle");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const Router = express.Router();
const config = require("config");
const { Redis, validateRedisItem } = require("../../models/redis");

Router.post(
  "/add",
  [auth, admin],
  handle(async (req, res) => {
    const { error } = validateRedisItem(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let existed = await Redis.findOne({ key: req.body.key });
    if (existed) {
      existed = await Redis.findOneAndUpdate(
        { key: req.body.key },
        { value: req.body.value },
        { new: true }
      );
      res.send(existed);
    } else {
      const item = new Redis({ key: req.body.key, value: req.body.value });
      let result = await item.save();
      res.send(result);
    }
  })
);

Router.get(
  "/get/:key",
  handle(async (req, res) => {
    let result = await Redis.findOne({ key: req.params.key });
    if (!result) return res.status(400).send("Content key was Not Found");
    res.send(result);
  })
);

Router.get(
  "/getAll",
  handle(async (req, res) => {
    let data = await Redis.find();
    if (!data) return res.status(400).send("There are no redis now");
    res.send(data);
  })
);

Router.delete(
  "/delete/:key",
  handle(async (req, res) => {
    const redis = await Redis.findOneAndDelete({ key: req.params.key });
    if (!redis)
      return res.status(400).send("The redis with the given id was not found");
    res.send(redis);
  })
);
module.exports = Router;
