const express = require("express");
const handle = require("../../middleware/handle");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const {
  redisImagesSchema: Redis,
  validateRedisItem,
  validateUpdateSubItemImage,
  validateRedis,
} = require("../../models/redisImages");
const { uploadImage, deleteImage } = require("../../services/cloudinary");
const upload = require("../../services/uploading")();
const _ = require("lodash");
const Router = express.Router();

Router.get(
  "/:key",
  handle(async (req, res) => {
    const redisItem = await Redis.findOne({ key: req.params.key });
    if (!redisItem) return res.status(400).send("not existed");
    res.send(redisItem);
  })
);

Router.post(
  "/addRedis",
  handle(async (req, res) => {
    let redis = { key: req.body.key, items: [] };
    let { error } = validateRedis(redis);
    if (error) return res.status(400).send(error.details[0].message);
    let existed = await Redis.findOne({ key: req.body.key });
    if (existed)
      return res.status(400).send("Redis with the same key was found");
    redis = new Redis({ key: req.body.key, items: [] });
    redis = await redis.save();
    res.send(redis);
  })
);

Router.post(
  "/addItem",
  [auth, admin],
  upload.single("image"),
  handle(async (req, res) => {
    if (!req.body.key) return res.status(400).send("Redis Key is required");
    let redisItem = await Redis.findOne({ key: req.body.key });
    if (!redisItem)
      return res.status(400).send("The Redis with the give key was found");
    let item = { title: req.body.title, link: req.body.link };
    let { error } = validateRedisItem(item);
    if (error) return res.status(400).send(error.details[0].message);
    let result = await uploadImage(req.file.path);
    if (result && result.url && result.public_id) item.image = result;
    else
      return res
        .status(400)
        .send("Something wrong happened while uploading the image");
    redisItem.items.push(item);
    redisItem = await redisItem.save();
    res.send(redisItem);
  })
);

Router.put(
  "/updateSubItemImage",
  [auth, admin],
  upload.single("image"),
  handle(async (req, res) => {
    let { error } = validateUpdateSubItemImage(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    if (!req.file)
      return res
        .status(400)
        .send("Request canceled because there is no image.");
    let existed = await Redis.findById(req.body.redisId);
    if (!existed) return res.status(400).send("Redis Item not existed");
    let item = existed.items.id(req.body.itemId);
    if (!item)
      return res
        .status(400)
        .send(`Sub item of "${existed.key}" item was not found`);
    let newItem = { title: item.title, link: item.link };
    await deleteImage(item.image.public_id);
    let result = await uploadImage(req.file.path);
    if (result.url && result.public_id) newItem.image = result;
    else
      return res.status(400).send("Error happened while uploading the image");
    existed.items.id(req.body.itemId).remove();
    existed.items.push(newItem);
    existed = await existed.save();
    res.send(existed);
  })
);

Router.put(
  "/updateSubItemData",
  [auth, admin],
  handle(async (req, res) => {
    let existed = await Redis.findById(req.body.redisId);
    if (!existed)
      return res
        .status(400)
        .send("The redis item with the given id was not found");
    let item = existed.items.id(req.body.itemId);
    if (!item)
      return res
        .status(400)
        .send("The sub item with the given id was not found");
    let newItem = { title: req.body.title, link: req.body.link };
    const { error } = validateRedisItem(newItem);
    if (error) return res.status(400).send(error.details[0].message);
    newItem.image = item.image;
    existed.items.id(req.body.itemId).remove();
    existed.items.push(newItem);
    existed = await existed.save();
    res.send(existed);
  })
);

Router.delete(
  "/deleteItem/:redisId/:itemId",
  [auth, admin],
  handle(async (req, res) => {
    const redis = await Redis.findById(req.params.redisId);
    if (!redis)
      return res.status(400).send("Redis with the given id was not found");
    let item = redis.items.id(req.params.itemId);
    if (!item) return res.status(400).send("Item not existed");
    await deleteImage(item.image.public_id);
    redis.items.id(req.params.itemId).remove();
    await redis.save();
    res.send("Done");
  })
);

Router.delete(
  "/deleteRedis",
  [auth, admin],
  handle(async (req, res) => {
    let redisItem = await Redis.findById({ key: req.body.key });
    if (!redisItem) return res.status(400).send("Item was not found");
    redisItem.items.forEach(
      async (item) => await deleteImage(item.image.public_id)
    );
    reidsItem = await Redis.findOneAndDelete({ key: req.body.key });
    res.send(redisItem);
  })
);

module.exports = Router;
