const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const twimlAppSid = process.env.TWIML_APP_SID;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Generate Access Token
app.get('/token', (req, res) => {
  const identity = req.query.identity || 'velo_rep';
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;
  const token = new AccessToken(accountSid, apiKey, apiSecret, { identity, ttl: 3600 });
  const voiceGrant = new VoiceGrant({ outgoingApplicationSid: twimlAppSid, incomingAllow: true });
  token.addGrant(voiceGrant);
  res.json({ token: token.toJwt(), identity });
});

// TwiML for outbound calls
app.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const dial = twiml.dial({ callerId: phoneNumber, timeout: 30 });
  if (req.body.To) { dial.number(req.body.To); }
  else { twiml.say('No number provided.'); }
  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(process.env.PORT || 3000, () => console.log('VeloDialer server running'));
