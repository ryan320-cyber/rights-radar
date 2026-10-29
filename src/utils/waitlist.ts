import { WaitlistPayload } from '../types';

const submittedEmails = new Set<string>();

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
}

/**
 * Submits waitlist & research survey data to the application backend.
 * GUARANTEE: Never claims success unless confirmed by the persistence layer.
 */
export async function submitWaitlist(
  payload: WaitlistPayload,
  apiBaseUrl?: string
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = payload.email.trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return {
      success: false,
      message: 'Veuillez saisir une adresse email valide.'
    };
  }

  if (!payload.usageFrequency) {
    return {
      success: false,
      message: 'Veuillez indiquer comment vous envisagez d’utiliser l’outil.'
    };
  }

  if (submittedEmails.has(cleanEmail)) {
    return {
      success: false,
      message: 'Cette adresse email est déjà inscrite sur la liste d’attente.'
    };
  }

  // Construct target URL safely for browser and Node environments
  const baseUrl = apiBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const targetUrl = `${baseUrl.replace(/\/$/, '')}/api/waitlist`;

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        profile: payload.interestTypes?.userResearch ? 'chercheur_recherche' : 'passager_frequent',
        frequency: payload.usageFrequency || 'occasionnel',
        notificationPref: payload.preferredPricingModel || 'forfait_fixe',
        pastDisruptions: payload.pastDisruptions ? JSON.stringify(payload.pastDisruptions) : null,
        pastClaimExperience: payload.pastClaimExperience || null,
        frequentAirlines: payload.frequentAirlines ? JSON.stringify(payload.frequentAirlines) : null,
        annualFlightCount: payload.annualFlightCount || null,
        preferredFeature: payload.preferredFeature || null,
        preferredPricingModel: payload.preferredPricingModel || null,
        feedbackOrFrustration: payload.feedbackOrFrustration || null,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 409 || errData.error?.includes('déjà')) {
        submittedEmails.add(cleanEmail);
        return {
          success: false,
          message: 'Cette adresse email est déjà inscrite sur la liste d’attente.'
        };
      }
      return {
        success: false,
        message: errData.error || 'Erreur lors de l’enregistrement. Veuillez réessayer.'
      };
    }

    const data = await res.json();
    if (data.success) {
      submittedEmails.add(cleanEmail);
      return {
        success: true,
        message: 'Votre participation a bien été enregistrée. Merci pour vos réponses précieuses !'
      };
    } else {
      return {
        success: false,
        message: data.error || 'Erreur lors de l’inscription.'
      };
    }
  } catch (err) {
    console.error('[Waitlist] Permanent submit failure:', err);
    return {
      success: false,
      message: 'Erreur réseau ou service indisponible. Veuillez vérifier votre connexion et réessayer.'
    };
  }
}

export function clearSubmittedEmailsCache(): void {
  submittedEmails.clear();
}
