import test from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateFlightRights,
  determineGeographicScope,
  validateWaitlistInput,
  generateClaimLetterTemplate,
  PRESCRIPTION_PERIODS,
} from './rightsCalculator.ts';

test('Sanity validation: invalid or negative inputs return insufficient information', () => {
  const res1 = estimateFlightRights({ distanceKm: -500, delayHours: 4, disruptionType: 'delay' });
  assert.equal(res1.status, 'insufficient_information');
  assert.equal(res1.isPotentiallyEligible, false);

  const res2 = estimateFlightRights({ distanceKm: 1000, delayHours: -2, disruptionType: 'delay' });
  assert.equal(res2.status, 'insufficient_information');
  assert.equal(res2.isPotentiallyEligible, false);
});

test('Geographic Scope: Departing EU/UK is ALWAYS covered under EC 261 / UK 261', () => {
  const scopeEU = determineGeographicScope({
    distanceKm: 5800,
    delayHours: 4,
    disruptionType: 'delay',
    departureCountry: 'FR',
    arrivalCountry: 'US',
    isEUOrUKCarrier: false, // Non-EU carrier departing EU (e.g. Delta CDG -> JFK)
  });
  assert.equal(scopeEU.scopeStatus, 'covered');
  assert.match(scopeEU.explanation, /au départ d’un aéroport situé dans l’Union européenne/);
});

test('Geographic Scope: Arriving in EU from non-EU on non-EU carrier is NOT covered (Delta JFK -> CDG)', () => {
  const scopeDelta = determineGeographicScope({
    distanceKm: 5840,
    delayHours: 4.5,
    disruptionType: 'delay',
    departureCountry: 'US',
    arrivalCountry: 'FR',
    isEUOrUKCarrier: false, // Delta Air Lines
  });
  assert.equal(scopeDelta.scopeStatus, 'not_covered');
  assert.match(scopeDelta.explanation, /non-UE/);

  const result = estimateFlightRights({
    distanceKm: 5840,
    delayHours: 4.5,
    disruptionType: 'delay',
    departureCountry: 'US',
    arrivalCountry: 'FR',
    isEUOrUKCarrier: false,
  });
  assert.equal(result.status, 'not_eligible');
  assert.equal(result.isPotentiallyEligible, false);
  assert.equal(result.estimatedAmountEuro, 0);
});

test('Geographic Scope: Arriving in EU from non-EU on EU carrier IS covered (Air France JFK -> CDG)', () => {
  const scopeAF = determineGeographicScope({
    distanceKm: 5840,
    delayHours: 4.5,
    disruptionType: 'delay',
    departureCountry: 'US',
    arrivalCountry: 'FR',
    isEUOrUKCarrier: true, // Air France
  });
  assert.equal(scopeAF.scopeStatus, 'covered');

  const result = estimateFlightRights({
    distanceKm: 5840,
    delayHours: 4.5,
    disruptionType: 'delay',
    departureCountry: 'US',
    arrivalCountry: 'FR',
    isEUOrUKCarrier: true,
  });
  assert.equal(result.status, 'eligible');
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 600);
});

test('Delay Compensation: < 3 hours gives 0 EUR', () => {
  const result = estimateFlightRights({
    distanceKm: 800,
    delayHours: 2.5,
    disruptionType: 'delay',
    departureCountry: 'FR',
    arrivalCountry: 'FR',
  });
  assert.equal(result.status, 'not_eligible');
  assert.equal(result.isPotentiallyEligible, false);
  assert.equal(result.estimatedAmountEuro, 0);
  assert.equal(result.tier, 'none');
});

test('Delay Compensation: <= 1500 km with >= 3h delay yields 250 EUR', () => {
  const result = estimateFlightRights({
    distanceKm: 750,
    delayHours: 3.5,
    disruptionType: 'delay',
    departureCountry: 'FR',
    arrivalCountry: 'FR',
  });
  assert.equal(result.status, 'eligible');
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 250);
  assert.equal(result.tier, 'short');
});

test('Delay Compensation: Intra-EU > 1500 km or 1500-3500 km yields 400 EUR', () => {
  const result = estimateFlightRights({
    distanceKm: 2100,
    delayHours: 4,
    disruptionType: 'delay',
    departureCountry: 'FR',
    arrivalCountry: 'GR', // Paris -> Athens (~2100 km)
  });
  assert.equal(result.status, 'eligible');
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 400);
  assert.equal(result.tier, 'medium');
});

test('Delay Compensation: Extra-EU > 3500 km with 3h-4h delay applies 50% reduction (300 EUR)', () => {
  const result = estimateFlightRights({
    distanceKm: 5800,
    delayHours: 3.2,
    disruptionType: 'delay',
    departureCountry: 'FR',
    arrivalCountry: 'US',
  });
  assert.equal(result.status, 'eligible');
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 300);
  assert.equal(result.tier, 'long');
});

test('Delay Compensation: Extra-EU > 3500 km with >= 4h delay yields full 600 EUR', () => {
  const result = estimateFlightRights({
    distanceKm: 5800,
    delayHours: 4.5,
    disruptionType: 'delay',
    departureCountry: 'FR',
    arrivalCountry: 'US',
  });
  assert.equal(result.status, 'eligible');
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 600);
  assert.equal(result.tier, 'long');
});

test('Cancellation: Notice >= 14 days is NOT eligible for compensation', () => {
  const result = estimateFlightRights({
    distanceKm: 1200,
    delayHours: 0,
    disruptionType: 'cancellation',
    departureCountry: 'FR',
    arrivalCountry: 'DE',
    cancellationNoticeDays: 15,
  });
  assert.equal(result.status, 'not_eligible');
  assert.equal(result.isPotentiallyEligible, false);
  assert.equal(result.estimatedAmountEuro, 0);
});

test('Cancellation: Notice < 14 days IS eligible for compensation', () => {
  const result = estimateFlightRights({
    distanceKm: 1200,
    delayHours: 0,
    disruptionType: 'cancellation',
    departureCountry: 'FR',
    arrivalCountry: 'DE',
    cancellationNoticeDays: 5,
  });
  assert.equal(result.status, 'eligible');
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 250);
});

test('Denied Boarding: Voluntary surrender is NOT eligible for automatic EC 261 compensation', () => {
  const result = estimateFlightRights({
    distanceKm: 2000,
    delayHours: 0,
    disruptionType: 'denied_boarding',
    departureCountry: 'FR',
    arrivalCountry: 'ES',
    isInvoluntaryDeniedBoarding: false,
  });
  assert.equal(result.status, 'not_eligible');
  assert.equal(result.isPotentiallyEligible, false);
});

test('Denied Boarding: Involuntary denied boarding IS eligible', () => {
  const result = estimateFlightRights({
    distanceKm: 2000,
    delayHours: 0,
    disruptionType: 'denied_boarding',
    departureCountry: 'FR',
    arrivalCountry: 'ES',
    isInvoluntaryDeniedBoarding: true,
  });
  assert.equal(result.status, 'eligible');
  assert.equal(result.isPotentiallyEligible, true);
  assert.equal(result.estimatedAmountEuro, 400);
});

test('Prescription periods respect verified national legislation and handle unknown jurisdiction', () => {
  assert.equal(PRESCRIPTION_PERIODS.FR.years, 5);
  assert.equal(PRESCRIPTION_PERIODS.UK.years, 6);
  assert.equal(PRESCRIPTION_PERIODS.DE.years, 3);
  assert.equal(PRESCRIPTION_PERIODS.ES.years, 5);
  assert.equal(PRESCRIPTION_PERIODS.IT.years, 2);
  assert.equal(PRESCRIPTION_PERIODS.BE.years, 1);

  const resUnknown = estimateFlightRights({
    distanceKm: 1000,
    delayHours: 3.5,
    disruptionType: 'delay',
    jurisdictionCountry: 'XX', // Unknown country
  });
  assert.equal(resUnknown.prescriptionYears, null);
  assert.match(resUnknown.prescriptionExplanation, /spécifique à la juridiction/);
});

test('Claim letter generation provides disruption-specific templates without false guarantees', () => {
  const delayLetter = generateClaimLetterTemplate({
    passengerName: 'Camille Dupont',
    bookingRef: 'AF7890',
    flightCode: 'AF 1234',
    departureAirport: 'Paris-CDG',
    arrivalAirport: 'Nice-NCE',
    flightDate: '2026-09-15',
    delayHours: 3.5,
    disruptionType: 'delay',
    estimatedAmount: 250,
    airlineName: 'Air France',
  });
  assert.match(delayLetter, /retard majeur d'au moins 3.5 heure/);
  assert.match(delayLetter, /250 €/);
  assert.doesNotMatch(delayLetter, /délai légal de 15 jours/); // Universal 15-day claim removed

  const cancelLetter = generateClaimLetterTemplate({
    passengerName: 'Camille Dupont',
    bookingRef: 'AF7890',
    flightCode: 'AF 1234',
    departureAirport: 'Paris-CDG',
    arrivalAirport: 'Madrid-MAD',
    flightDate: '2026-09-15',
    disruptionType: 'cancellation',
    estimatedAmount: 400,
    airlineName: 'Iberia',
  });
  assert.match(cancelLetter, /annulé par le transporteur/);
  assert.match(cancelLetter, /400 €/);
});
