const express = require("express");
const handle = require("../../middleware/handle");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const { validateRequest, Requests } = require("../../models/request");
const validateObjectId = require("../../middleware/validateObjectId");
const { Cars } = require("../../models/car");
const { User } = require("../../models/user");
const _ = require("lodash");
const Router = express.Router();

Router.post(
  "/:id",
  validateObjectId,
  [auth],
  handle(async (req, res) => {
    let date = Date(Date.now());
    const { error } = validateRequest({
      car_id: req.params.id,
      user_id: toString(req.user._id),
      date: date,
    });
    if (error) return res.status(400).send(error.details[0].message);
    let car = await Cars.findById(req.params.id);
    if (!car)
      return res.status(400).send("The car with the given id was not found");
    let newRequest = new Requests({
      user_id: req.user._id,
      car_id: req.params.id,
      date: date,
    });
    newRequest = await newRequest.save();
    res.send(newRequest);
  })
);

Router.get(
  "/",
  [auth, admin],
  handle(async (req, res) => {
    const requests = await Requests.find({});
    if (!requests) return res.status(400).send("There are no requests yet");
    let UsersRequeusts = [];
    requests.forEach(async (item) => {
      let user = await User.findById(req.user._id);
      if (user) {
        UsersRequeusts.push({
          _id: item._id,
          name: user.name,
          email: user.email,
          car_id: item.car_id,
          date: item.date,
          phone: user.phone,
        });
      }
      if (requests.length - 1 === requests.indexOf(item))
        res.send(UsersRequeusts);
    });
  })
);

Router.delete(
  "/:id",
  validateObjectId,
  [auth, admin],
  handle(async (req, res) => {
    let request = await Requests.findById(req.params.id);
    if (!request)
      res.status(400).send("the request with the given id was not found");
    request = await Requests.findByIdAndDelete(req.params.id);
    res.send(request);
  })
);

Router.delete(
  "/",
  [auth, admin],
  handle(async (req, res) => {
    let ids = req.body;
    ids.forEach(async (item) => {
      let request = await Requests.findById(item);
      if (!request)
        return res.status(400).send("There are a request was not found");
      await Requests.findByIdAndDelete(item);
    });
    res.send("Done");
  })
);
module.exports = Router;
