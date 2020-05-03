const config = require("config");
const winston = require("winston");
module.exports = function () {
  if (!config.has("name"))
    winston.error("Application without name like body without head , bro");
  if (!config.has("connectionString"))
    winston.error(
      "Application should have a connection string to be able to connect to the database."
    );
  if (!config.has("FrontEndUrl"))
    winston.error(
      "The application should have a front-end url to make access for. If it's undefined it will throw an error"
    );
  if (!config.has("CLOUDINARY_URL"))
    winston.error(
      "The application should have a CLOUDINARY_URL for managing images uploading and transferring. If it's undefined it will throw an error"
    );
  if (!config.has("Mail_UserName") && !config.has("Mail_Password"))
    winston.error(
      "The application should have a Email_UserName and Mail_Passwrod for managing sending mails. If it's undefined it will throw an error"
    );
  if (!config.has("Twilio_accountSid") && !config.has("Twilio_authToken"))
    winston.error(
      "The application should have a Twilio_accountSid and Twilio_authToken for managing sending SMS verification code. If it's undefined it will throw an error"
    );
  if (!config.has("Twilio_ServiceSid"))
    winston.error(
      "The application should have a Twilio_ServiceSid for managing mobile verification. If it's undefined it will throw an error"
    );
  if (!config.has("Twilio_authToken"))
    winston.error(
      "The application should have a Twilio_authToken for managing mobile verification. If it's undefined it will throw an error"
    );

  // if (!config.has("REDISCLOUD_URL"))
  //   winston.error(
  //     "The application should have a REDISCLOUD_URL for managing redis data storage. If it's undefined it will throw an error"
  //   );
  Promise.reject("Configuration Error");
};
