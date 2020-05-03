const config = require("config");
const cars = require("../routes/car/car");
const auth = require("../routes/user/auth");
const user = require("../routes/user/user");
const redis = require("../routes/redis/redis");
const blog = require("../routes/blog/blog");
const redisImages = require("../routes/redis/redisImages");
const Requests = require("../routes/requests/requests");
const Contacts = require("../routes/contact/contact");
module.exports = function (app) {
  app.use((req, res, next) => {
    let allowedOrigins = [
      "http://" + config.get("FrontEndUrl"),
      "https://" + config.get("FrontEndUrl"),
    ];
    let origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Key, x-auth-token, multipart/form-data"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, GET, DELETE, OPTIONS"
    );
    next();
  });
  app.use("/api/users", user);
  app.use("/api/auth", auth);
  app.use("/api/cars", cars);
  app.use("/api/redis", redis);
  app.use("/api/redisImages", redisImages);
  app.use("/api/blog", blog);
  app.use("/api/requests", Requests);
  app.use("/api/contacts/", Contacts);
};
