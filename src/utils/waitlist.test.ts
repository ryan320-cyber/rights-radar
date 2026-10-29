import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmail, submitWaitlist, clearSubmittedEmailsCache } from './waitlist.ts';

test('validateEmail checks email formatting correctly', () => {
  assert.equal(validateEmail('test@example.com'), true);
  assert.equal(validateEmail('USER@DOMAIN.FR'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail(''), false);
  assert.equal(validateEmail('test@domain'), false);
});

test('submitWaitlist requires valid email and frequency', async () => {
  clearSubmittedEmailsCache();

  // Invalid email
  const resInvalid = await submitWaitlist({
    email: 'bad-email',
    usageFrequency: 'once',
    interestTypes: { userResearch: true, legalSupport: false, pricingFeedback: false }
  });
  assert.equal(resInvalid.success, false);
  assert.match(resInvalid.message, /adresse email valide/);

  // Missing frequency
  const resMissingFreq = await submitWaitlist({
    email: 'valid@example.fr',
    usageFrequency: '' as any,
    interestTypes: { userResearch: true, legalSupport: false, pricingFeedback: false }
  });
  assert.equal(resMissingFreq.success, false);
  assert.match(resMissingFreq.message, /envisagez d’utiliser/);
});

test('submitWaitlist handles network errors and non-2xx responses without false success', async () => {
  clearSubmittedEmailsCache();

  // Mock global fetch to simulate 500 server error
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ error: 'Database unavailable' }), { status: 500 });

  try {
    const resServerError = await submitWaitlist({
      email: 'user@example.com',
      usageFrequency: 'multiple',
      interestTypes: { userResearch: true, legalSupport: false, pricingFeedback: false }
    }, 'http://localhost:3000');

    assert.equal(resServerError.success, false);
    assert.match(resServerError.message, /Database unavailable|Erreur/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('submitWaitlist returns success only when backend confirms 201 created', async () => {
  clearSubmittedEmailsCache();

  // Mock global fetch to simulate successful 201 creation
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ success: true, submission: { id: 1 } }), { status: 201 });

  try {
    const resSuccess = await submitWaitlist({
      email: 'success.user@example.fr',
      usageFrequency: 'multiple',
      interestTypes: { userResearch: true, legalSupport: false, pricingFeedback: false }
    }, 'http://localhost:3000');

    assert.equal(resSuccess.success, true);
    assert.match(resSuccess.message, /enregistrée/);

    // Test duplicate submission prevention
    const resDup = await submitWaitlist({
      email: 'success.user@example.fr',
      usageFrequency: 'multiple',
      interestTypes: { userResearch: true, legalSupport: false, pricingFeedback: false }
    }, 'http://localhost:3000');

    assert.equal(resDup.success, false);
    assert.match(resDup.message, /déjà inscrite/);
  } finally {
    global.fetch = originalFetch;
  }
});
