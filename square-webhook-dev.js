// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Parse incoming JSON
app.use(bodyParser.json());

// In-memory queue (for testing)
let songQueue = [];

/**
 * Convert payment amount to priority weight:
 * $1 -> 1 (normal)
 * $3 -> 2 (bump)
 * $5 -> 3 (jump queue)
 * $10+ -> 4 (instant play)
 */
function getPriorityWeight(amount) {
  if (amount >= 10) return 4;
  if (amount >= 5) return 3;
  if (amount >= 3) return 2;
  return 1;
}

// Webhook endpoint
app.post('/square-webhook', (req, res) => {
  // Safely get the payment object
  const payment = req.body?.data?.object?.payment;

  if (!payment) {
    console.log('No payment object found!');
    console.log('Full webhook body:', JSON.stringify(req.body, null, 2));
    return res.status(400).send('No payment data');
  }

  // Only process completed payments
  if (payment.status !== 'COMPLETED') {
    console.log('Payment not completed yet:', payment.status);
    return res.status(200).send('Payment not completed');
  }

  const amountPaid = payment.amount_money.amount / 100; // Square amounts are in cents
  const note = payment.note || 'No note';
  const priorityWeight = getPriorityWeight(amountPaid);

  console.log('✅ Payment received:', {
    id: payment.id,
    amountPaid,
    currency: payment.amount_money.currency,
    note,
    priorityWeight
  });

  // Add to in-memory queue
  songQueue.push({ note, amountPaid, priorityWeight, timestamp: Date.now() });

  // Sort queue: higher priority first, then by timestamp (first-come-first-serve)
  songQueue.sort((a, b) => {
    if (b.priorityWeight !== a.priorityWeight) return b.priorityWeight - a.priorityWeight;
    return a.timestamp - b.timestamp;
  });

  // Log the current queue
  console.log('🎵 Current queue order:');
  songQueue.forEach((item, index) => {
    console.log(`${index + 1}. ${item.note} (priority ${item.priorityWeight})`);
  });

  res.status(200).send('Webhook processed');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});