const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");
module.exports = function() {
  const conn = config.get("connectionString");
  mongoose
    .connect(conn, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    })
    .then(() => winston.info(`connected to db server ${conn}`))
    .catch(ex => {
      winston.error(ex.message, ex);
    });
};
