const { User, authUser } = require("../../models/user");
const bcrypt = require("bcrypt");
const express = require("express");
const _ = require("lodash");
const handle = require("../../middleware/handle");
const { transporter } = require("../../services/mail");
const config = require("config");
const router = express.Router();

router.post(
  "/",
  handle(async (req, res) => {
    const { error } = authUser(req.body);
    if (error) res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid email or password");
    if (!user.confirmed) {
      const token = user.generateAuthToken();
      var fullUrl =
        req.protocol +
        "://" +
        req.get("host") +
        "/api/users/confirming/" +
        token;
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
      return res
        .status(400)
        .send(
          "Email not confirmed, go to your email and click the link to confirm."
        );
    }
    if (!user.phoneConfirmed) {
      return res.status(401).send({ mobile: "Mobile Not Confirmed" });
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (validPassword === false)
      return res.status(400).send("Invalid email or password");
    const token = user.generateAuthToken();
    res.status(200).send({ token: token });
  })
);

// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//     redirect: config.get("callbackURL")
//   })
// );
// router.get(
//   "/google/reirect",
//   passport.authenticate("google", { redirect: config.get("callbackURL") }),
//   function onAuthenticate(req, res) {
//     var profile = req.user.profile;
//     res.send({
//       username: profile.name,
//       email: profile.email,
//       gender: profile.gender
//     });
//   }
// );

module.exports = router;
