const express = require("express");
const Router = express.Router();
const handle = require("../../middleware/handle");
const { contactModel, validateContact } = require("../../models/contacts");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const validateId = require("../../services/validateObjectId");
const validateObjectId = require("../../middleware/validateObjectId");
Router.post(
  "/",
  handle(async (req, res) => {
    const reuslt = validateContact(req.body);
    if (reuslt.error)
      return res.status(400).send(reuslt.error.details[0].message);
    let newcontact = new contactModel(req.body);
    newcontact = await newcontact.save();
    res.send(newcontact);
  })
);

Router.get(
  "/",
  [auth, admin],
  handle(async (req, res) => {
    const contacts = await contactModel.find({});
    if (!contacts || contacts.length === 0)
      return res.status(400).send("There are no contacts existed now.");
    res.send(contacts);
  })
);
Router.delete(
  "/:id",

  validateObjectId,
  [auth, admin],
  handle(async (req, res) => {
    const contact = await contactModel.findByIdAndDelete(req.params.id);
    if (!contact)
      return res.status(400).send("Contact with the given id was not found");
    res.send(contact);
  })
);
Router.delete(
  "/",
  [auth, admin],
  handle(async (req, res) => {
    const ids = req.body;
    ids.forEach(async (item) => {
      if (validateId(item)) {
        const contact = await contactModel.findByIdAndDelete(item);
        if (!contact)
          return res
            .status(400)
            .send("The Contect with the provided id was not found");
      } else return res.status(400).send("Contact Id is invalid");
    });
    res.send("done");
  })
);

module.exports = Router;
