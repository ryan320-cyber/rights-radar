import { db } from './index.ts';
import { users, waitlist, flightScans } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string | null, photoUrl?: string | null) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
          photoUrl: photoUrl || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function addWaitlistSubmission(data: {
  email: string;
  profile: string;
  frequency: string;
  notificationPref: string;
  pastDisruptions?: string | null;
  pastClaimExperience?: string | null;
  frequentAirlines?: string | null;
  annualFlightCount?: string | null;
  preferredFeature?: string | null;
  preferredPricingModel?: string | null;
  feedbackOrFrustration?: string | null;
}) {
  try {
    const result = await db
      .insert(waitlist)
      .values(data)
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database addWaitlistSubmission failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function saveFlightScan(data: {
  userId?: number | null;
  flightNumber: string;
  flightDate?: string;
  route?: string;
  delayMinutes?: number;
  amountEstimated?: number;
  claimLetter?: string;
}) {
  try {
    const result = await db
      .insert(flightScans)
      .values(data)
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database saveFlightScan failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getUserFlightScans(userId: number) {
  try {
    return await db
      .select()
      .from(flightScans)
      .where(eq(flightScans.userId, userId))
      .orderBy(desc(flightScans.createdAt));
  } catch (error) {
    console.error('Database getUserFlightScans failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}
