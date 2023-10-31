// hashWebhook.js
const crypto = require('crypto');
const secretKey = "GSLDrYtqLmXDJRHbqtUwDQLwKBbEgPvu";

function calcAuthSigHash(data) {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(data);
  return hmac.digest('hex');
}

async function handler(req, res) {
  if (req.method === 'POST') {
    const payload = JSON.stringify(req.body);
    const receivedSignature = req.headers['x-signature'];
    const expectedSignature = calcAuthSigHash(payload);

    if (receivedSignature === expectedSignature) {
      res.status(200).send('Webhook received and verified');
    } else {
      res.status(400).send('Invalid signature');
    }
  } else {
    res.status(405).send('Method not allowed');
  }
}

module.exports = handler;
