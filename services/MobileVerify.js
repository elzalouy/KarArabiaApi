const config = require("config");
const twilio = require("twilio");

async function send(number, channel) {
  const accountSid = config.get("Twilio_accountSid");
  const token = config.get("Twilio_authToken");
  const sid = config.get("Twilio_ServiceSid");
  let client = twilio(accountSid, token);
  let response = await client.verify.services(sid).verifications.create({
    to: number,
    channel: channel,
  });
  return response;
}

async function check(number, code, vsid) {
  const accountSid = config.get("Twilio_accountSid");
  const token = config.get("Twilio_authToken");
  const sid = config.get("Twilio_ServiceSid");
  let client = twilio(accountSid, token);
  let response = await client.verify.services(sid).verificationChecks.create({
    to: number,
    code: code,
    verificationSid: vsid,
  });
  return response.status;
}
module.exports = { send, check };
