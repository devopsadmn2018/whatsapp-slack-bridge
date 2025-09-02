// server.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const {
  SLACK_WEBHOOK_URL,
  SLACK_BOT_TOKEN,
  SLACK_CHANNEL_ID,
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM,
} = process.env;

async function sendWhatsApp(to, body) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;

  const payload = new URLSearchParams({
    From: TWILIO_WHATSAPP_FROM,
    To: `whatsapp:${to}`,
    Body: body,
  });

  await axios.post(url, payload, {
    auth: {
      username: TWILIO_SID,
      password: TWILIO_AUTH_TOKEN,
    },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

// WhatsApp → Slack
app.post('/incoming-whatsapp', async (req, res) => {
  const from = req.body.From.replace('whatsapp:', '');
  const msg = req.body.Body;

  await axios.post(SLACK_WEBHOOK_URL, {
    text: `📩 *Message from ${from}*\n${msg}\n\n_Reply in Slack with:_ \`+${from} your reply here\``,
  });

  res.sendStatus(200);
});

// Slack → WhatsApp
app.post('/incoming-slack', async (req, res) => {
  if (req.body.type === 'url_verification') {
    return res.send(req.body.challenge); // Slack verification
  }

  const { event } = req.body;
  if (!event || event.bot_id || event.type !== 'message') {
    return res.sendStatus(200);
  }

  const phoneMatch = event.text.match(/\+[\d]{8,15}/);
  if (phoneMatch) {
    const phone = phoneMatch[0];
    const message = event.text.replace(phone, '').trim();
    await sendWhatsApp(phone, message);
  }

  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('✅ WhatsApp ↔ Slack Bridge is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
