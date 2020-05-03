const express = require("express");
const handle = require("../../middleware/handle");
const auth = require("../../middleware/auth");
const {
  Cars,
  validateCar,
  validateFeature,
  validateKeyValue,
  validateEditCar,
} = require("../../models/car");
const upload = require("../../services/uploading")();
const {
  deletePublic,
  uploadImage,
  deleteImage,
} = require("../../services/cloudinary");
const admin = require("../../middleware/admin");
const Router = express.Router();
const _ = require("lodash");
Router.get(
  "/",
  handle(async (req, res) => {
    const cars = await Cars.find({});
    if (!cars) return res.status(400).send("There are no cars.");
    if (cars.length === 0)
      return res.status(400).send("There are no any cars now");
    res.send(cars);
  })
);

Router.get(
  "/randomImages/:limit",
  handle(async (req, res) => {
    let items = await Cars.find({}).select("images");
    let images = [{}];
    for (let i = 0; i < items.length; i++) {
      images = _.concat(images, items[i].images);
    }
    _.remove(images, (s) => s === {});
    if (!images) return res.status(400).send("There are no images right now");
    let random = _.sampleSize(images, parseInt(req.params.limit));
    res.send(random);
  })
);

Router.get(
  "/:id",
  handle(async (req, res) => {
    const id = req.params.id;
    let car = await Cars.findById(id);
    if (car.images.length) res.send(car);
    else
      res.status(400).send("Car did not load because, it does not have images");
  })
);
Router.get(
  "/:sortedBy/:maxCount",
  handle(async (req, res) => {
    let cars = await Cars.find()
      .sort(req.params.sortedBy)
      .limit(
        parseInt(req.params.maxCount) > 0 && parseInt(req.params.maxCount)
      );
    if (!cars) return res.status(400).send("There are no cars now");
    res.send(cars);
  })
);

Router.post(
  "/",
  [auth, admin],
  handle(async (req, res) => {
    for (let i = 0; i < req.body.extra_features.length; i++) {
      const { error } = validateFeature(req.body.extra_features[i]);
      for (let j = 0; j < req.body.extra_features[i].items.length; j++) {
        const { error } = validateKeyValue(req.body.extra_features[i].items[j]);
        if (error) return res.status(400).send(error.details[0].message);
      }
      if (error) return res.status(400).send(error.details[0].message);
    }
    const { error } = validateCar(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const car = new Cars({
      name: req.body.name,
      short_desc: req.body.short_desc,
      model: req.body.model,
      kilometers: req.body.kilometers,
      speed: req.body.speed,
      body_type: req.body.body_type,
      transmission: req.body.transmission,
      color: req.body.color,
      doors: req.body.doors,
      fuel_type: req.body.fuel_type,
      status: req.body.status,
      long_desc: req.body.long_desc,
      price: req.body.price,
      extra_features: req.body.extra_features,
      date: Date(Date.now()),
    });
    let result = await car.save();
    res.send(result);
  })
);

Router.post(
  "/images",
  [auth, admin],
  upload.array("images"),
  handle(async (req, res) => {
    try {
      let car = await Cars.findById(req.body.id);
      if (!car) res.status(400).send("Car not existed");
      if (req.files.length + car.images.length > 6)
        return res
          .status(400)
          .send("The maximum number of images is 6 images.");
      for (let i = 0; i < req.files.length; i++) {
        const result = await uploadImage(req.files[i].path);
        if (result && result.url && result.public_id) {
          car.images.push(result);
        }
      }
      await car.save();
      deletePublic();
      res.status(200).send("done");
    } catch (ex) {
      await Cars.findByIdAndDelete(req.body.id);
    }
  })
);

Router.put(
  "/:id",
  [auth, admin],
  handle(async (req, res) => {
    let car = await Cars.findById(req.params.id);
    if (!car)
      return res.status(400).send("The car with the given id was not found");
    const { error } = validateEditCar(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let items = _.filter(car.images, (s) => {
      let item = req.body.images.find((x) => x.url === s.url);
      if (!item) return s;
    });
    items.forEach(async (item) => await deleteImage(item.public_id));
    car = await Cars.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(car);
  })
);

Router.delete(
  "/:id",
  [auth, admin],
  handle(async (req, res) => {
    let car = await Cars.findById(req.params.id);
    if (!car)
      return res.status(400).send("The Car with the given id was not found.");
    car.images.forEach(async (item) => await deleteImage(item.public_id));
    car = await Cars.findByIdAndDelete(req.params.id);
    if (!car) return res.status(400).send("Car not existed");
    res.send("Done");
  })
);

module.exports = Router;
