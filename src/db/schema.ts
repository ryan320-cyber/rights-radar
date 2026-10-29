import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table authenticated via Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Waitlist submissions table with full survey questionnaire support
export const waitlist = pgTable('waitlist', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  profile: text('profile').notNull(),
  frequency: text('frequency').notNull(),
  notificationPref: text('notification_pref').notNull(),
  pastDisruptions: text('past_disruptions'), // JSON string array of disruptions
  pastClaimExperience: text('past_claim_experience'),
  frequentAirlines: text('frequent_airlines'), // JSON string array of airlines
  annualFlightCount: text('annual_flight_count'),
  preferredFeature: text('preferred_feature'),
  preferredPricingModel: text('preferred_pricing_model'),
  feedbackOrFrustration: text('feedback_or_frustration'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// User flight scans and generated compensation claims
export const flightScans = pgTable('flight_scans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  flightNumber: text('flight_number').notNull(),
  flightDate: text('flight_date'),
  route: text('route'),
  delayMinutes: integer('delay_minutes'),
  amountEstimated: integer('amount_estimated'),
  claimLetter: text('claim_letter'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  flightScans: many(flightScans),
}));

export const flightScansRelations = relations(flightScans, ({ one }) => ({
  user: one(users, {
    fields: [flightScans.userId],
    references: [users.id],
  }),
}));
