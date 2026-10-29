import test from 'node:test';
import assert from 'node:assert/strict';
import { extractAirlineName, scanGmailFlightReceipts } from './gmailService.ts';

test('extractAirlineName detects airlines from headers correctly', () => {
  assert.equal(extractAirlineName('Air France <serviceclient@airfrance.fr>', 'Confirmation de vol'), 'Air France');
  assert.equal(extractAirlineName('Delta Air Lines <receipt@delta.com>', 'Flight Schedule'), 'Delta Air Lines');
  assert.equal(extractAirlineName('easyJet <info@easyjet.com>', 'Your booking'), 'easyJet');
  assert.equal(extractAirlineName('Iberia <reservas@iberia.es>', 'Reserva confirmada'), 'Iberia');
  assert.equal(extractAirlineName('Unknown Sender', 'No subject'), 'Compagnie Aérienne');
});

test('scanGmailFlightReceipts never returns fictitious demo records on empty or failed scans', async () => {
  const originalFetch = global.fetch;

  // Mock fetch returning 0 messages
  global.fetch = async () => new Response(JSON.stringify({ messages: [] }), { status: 200 });

  try {
    const results = await scanGmailFlightReceipts('mock-token');
    assert.ok(Array.isArray(results));
    assert.equal(results.length, 0); // Must be strictly empty when no emails match
  } finally {
    global.fetch = originalFetch;
  }
});
