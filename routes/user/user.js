const {
  User,
  validateUpdate,
  validateChangePassword,
  validateForgotPassword,
  verifyToken,
  validateRegister,
} = require("../../models/user");
const bcrypt = require("bcrypt");
const express = require("express");
const _ = require("lodash");
const router = express.Router();
const handle = require("../../middleware/handle");
const { transporter } = require("../../services/mail");
const verify = require("../../middleware/confirmEmail");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const config = require("config");
const upload = require("../../services/uploading")();
const { uploadImage, deleteImage } = require("../../services/cloudinary");
const Random = require("../../services/random");
const { send, check } = require("../../services/MobileVerify");
router.post(
  "/",
  handle(async (req, res) => {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send("this email already registered before.");
    user = await User.findOne({ phone: req.body.phone });
    if (user)
      return res.status(400).send("this phone already registered before.");
    const salt = await bcrypt.genSalt(10);
    user = {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, salt),
      confirmed: false,
      isAdmin: false,
      phone: req.body.phone,
      phoneConfirmed: false,
    };
    user = new User(user);
    user = await user.save();
    const token = user.generateAuthToken();
    var fullUrl =
      req.protocol + "://" + req.get("host") + "/api/users/confirming/" + token;
    await transporter.sendMail({
      from: config.get("Mail_UserName"),
      to: user.email,
      subject: "Confirm Email",
      html: `<body style="background-color:#f8f9fa">  
      <div  style="background-color:#fff;box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.15);padding:20px; text-align:left;width:auto;">
      <h4>
        <bold>Kar Arabia</bold>
      </h4>
        <p>
          Hope you well ${req.body.name},  
          This email registered to <a href='https://kararbia.herokuapp.com' style="">Karabia</a> <br> To confirm the request
          should click <a style="background-color:#fd7e14; border:0; border-radius:5px;padding:5px;font-size:12px;" href=${fullUrl}>Confirm Email</a> 
        </p>
        Thank You
      </div>
      </body>
      `,
    });
    res.status(200).send(_.pick(user, ["_id", "name", "email"]));
  })
);

// router.put(
//   "/update",
//   [auth],
//     const { error } = validateUpdate(req.body);
//   handle(async (req, res) => {
//     if (error) await res.status(400).send(error.details[0].message);
//     const user = await User.findByIdAndUpdate(req.user._id, req.body, {
//       new: true
//     });
//     if (!user)
//       return res
//         .status(400)
//         .send("the user with the given id was not existed.");
//     res.send(user);
//   })
// );
router.post(
  "/upload",
  auth,
  upload.single("profile_photo"),
  handle(async (req, res) => {
    const user_id = req.user._id;
    let user = await User.findById(user_id);
    if (user && user.profile_photo) deleteImage(user.profile_photo.public_id);
    if (!user)
      return res.status(400).send("Error occureed while saving the photo.");
    const path = req.file.path;
    const result = await uploadImage(path);
    if (result) {
      user.profile_photo = result;
      await user.save();
    }
    res.send("done");
  })
);

router.get(
  "/confirming/:token",
  [verify],
  handle(async (req, res, next) => {
    res.redirect(req.protocol + "://" + config.get("FrontEndUrl") + "/login");
  })
);

router.get(
  "/mobileConfirm/:number/:channel",
  handle(async (req, res) => {
    let number = req.params.number;
    console.log("number", number);
    let channel = req.params.channel;
    let user = await User.findOne({ phone: number, phoneConfirmed: true });
    if (user)
      return res
        .status(401)
        .send("This number is already existed and confirmed.");

    user = await User.findOne({ phone: number, phoneConfirmed: false });
    if (!user)
      return res.status(401).send("This number was not registered before..");
    let result = await send(number, channel);
    res.send({ sid: result.sid });
  })
);
router.get(
  "/mobileCode/:number/:code/:sid",
  handle(async (req, res, next) => {
    const code = req.params.code;
    const number = req.params.number;
    let user = await User.findOne({ phone: number, phoneConfirmed: true });
    if (user)
      return res
        .status(401)
        .send("This number is already existed and confirmed.");
    user = await User.findOne({ phone: number, phoneConfirmed: false });
    if (!user)
      return res.status(401).send("This number is not registered before..");
    let sid = req.params.sid;
    let response = await check(number, code, sid);
    if (response === "approved") {
      user = await User.findOneAndUpdate(
        { phone: number },
        { phoneConfirmed: true },
        { new: true }
      );
      if (user === null) return res.status(401).send("Bad Request");
      else return res.status(200).send("done");
    } else res.status(400).send("wrong code");
  })
);

router.post(
  "/search",
  handle(async (req, res) => {
    let users = await User.find({
      name: { $regex: req.body.name },
    }).select("name  profile_photo");
    if (!users) res.status(400).send("there are no users with this  name");
    res.status(200).send(users);
  })
);

router.get(
  "/byid/:id",
  handle(async (req, res) => {
    let user = await User.findById(req.params.id);
    if (!user) res.status(400).send("user with the given id was not found");
    user = _.omit(user, ["password", "confirmed", "isAdmin"]);
    res.status(200).send(user);
  })
);

router.get(
  "/admins",
  [auth, admin],
  handle(async (req, res) => {
    let admins = await User.find({
      isAdmin: true,
      _id: { $ne: req.user._id },
    }).select("name email profile_photo");
    if (!admins || admins.length === 0)
      return res
        .status(400)
        .send("there are no admins, only you are the admin.");
    res.status(200).send(admins);
  })
);

router.get(
  "/makeAdmin/:id",
  [auth, admin],
  handle(async (req, res) => {
    let admin = await User.findById(req.user._id);
    if (!admin) return res.status(401).send("Unauthorized Request");
    let user = await User.findById(req.params.id);
    if (!user)
      return res.status(400).send("the user with the given id was not found");
    if (user.isAdmin) return res.status(400).send("the user is already admin");
    user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      { isAdmin: true, adminAt: Date.now() },
      { new: true }
    ).select("name profile_photo email isAdmin");
    res.status(200).send(user);
  })
);

router.get(
  "/removeAdmin/:id",
  [auth, admin],
  handle(async (req, res) => {
    let admin = await User.findById(req.user._id);
    if (!admin) return res.status(401).send("Unauthorized Request");
    let user = await User.findById(req.params.id);
    if (!user)
      return res.status(400).send("the user with the given id was not found");
    if (user.adminAt && admin.adminAt > user.adminAt)
      return res
        .status(400)
        .send("You can't remove this admin, cause he is older than you.");
    user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        isAdmin: false,
        adminAt: null,
      },
      { new: true }
    );
    res.send(user);
  })
);

router.put(
  "/changePssword",
  auth,
  handle(async (req, res) => {
    let id = req.user._id;
    let user = await User.findById(id);
    let { error } = validateChangePassword(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const validPassword = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );
    if (validPassword === false)
      return res.status(400).send("You entered wrong password");
    const salt = await bcrypt.genSalt(10);
    let oldPassword = user.password;
    let newEncPassword = await bcrypt.hash(req.body.newPassword, salt);
    user = await User.findByIdAndUpdate(
      user._id,
      {
        oldPassword: oldPassword,
        password: newEncPassword,
      },
      { new: true }
    );
    let confirmChangingPasswordToken = user.generateAuthToken();
    var fullUrl =
      req.protocol +
      "://" +
      req.get("host") +
      "/api/users/passwordAttack/" +
      confirmChangingPasswordToken;
    await transporter.sendMail({
      from: config.get("Mail_UserName"),
      to: user.email,
      subject: "KarArabia Support, Password Changed",
      html: `<h4>Dear ${user.name}</h4><p>We have noticed that you have changed your password if you didn't change it and didn't permit that Changement, Click this link to reset your password.</p>
      <a href="${fullUrl}">Confirm Your Email</a>`,
    });
    res.send({ token: confirmChangingPasswordToken });
  })
);

router.get(
  "/passwordAttack/:token",
  verify,
  handle(async (req, res) => {
    let id = req.user._id;
    const salt = await bcrypt.genSalt(10);
    let randomVal = Random(10);
    let EncryptedRandomVal = await bcrypt.hash(randomVal, salt);
    let password = EncryptedRandomVal;
    let user = await User.findByIdAndUpdate(
      id,
      {
        password: password,
      },
      { new: true }
    );
    await transporter.sendMail({
      from: config.get("Mail_UserName"),
      to: user.email,
      subject: "KarArabia Support : Reset Password",
      html: `<h3>Dear ${user.name}</h3> <p>We generated a random password for you, but you must reset your password with a strong one. Here is your new password <mark>${randomVal}</mark> </p>`,
    });
    res.redirect(config.get("FrontEndUrl"));
  })
);
router.get(
  "/resetPassword/:email",
  handle(async (req, res) => {
    let email = req.params.email;
    let user = await User.findOne({ email: email });
    if (!user) return res.status(400).send("email not existed");
    let token = user.ResetPasswordToken();
    var fullUrl = config.get("FrontEndUrl") + "/ResetPassword/" + token;
    await transporter.sendMail({
      from: config.get("Mail_UserName"),
      to: user.email,
      subject: "Kararbia Support : Forget Password",
      html: `
    <h2>Dear ${user.name}</h2>
    <p>We accepted a request form that email to reset his password, click </p> <a href=${fullUrl}>Reset Password</a> to insure your request.  
    `,
    });
    res.send("We send an email, Check your inbox, please.");
  })
);
router.post(
  "/ResetPassword",
  handle(async (req, res) => {
    const { error } = validateForgotPassword(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let decodedData = verifyToken(req.body.token);
    if (decodedData.action !== "reset")
      return res.status(403).send("Access Denied");
    let user = await User.findById(decodedData._id);
    if (!user) return res.status(403).send("Access Denied");
    const salt = await bcrypt.genSalt(10);
    let update = await User.findOneAndUpdate(
      { _id: decodedData._id },
      {
        password: await bcrypt.hash(req.body.newPassword, salt),
      },
      { new: true }
    );
    if (!update) return res.status(400).send("Error");
    res.status(200).send("Password changed");
  })
);
module.exports = router;
