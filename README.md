# WhatsApp ↔ Slack Bridge

Two-way communication bridge between WhatsApp (via Twilio) and Slack.

## Endpoints

- `POST /incoming-whatsapp` – handles WhatsApp messages and sends to Slack.
- `POST /incoming-slack` – handles Slack replies and sends to WhatsApp.

## Environment Variables

Copy `.env.example` to `.env` and fill in your actual credentials.

## Deployment

You can deploy this on Render, Railway, or any Node.js hosting platform.

