/**
 * Core estimation and validation logic for Rights Radar.
 * All amounts and legal regimes are estimates calculated under Regulation (EC) No 261/2004,
 * UK Regulation 261, and applicable national limitation periods.
 */

export type DisruptionType = 'delay' | 'cancellation' | 'denied_boarding';

export interface FlightEstimationInput {
  distanceKm: number;
  delayHours: number;
  disruptionType: DisruptionType;
  departureAirport?: string;
  departureCountry?: string; // ISO 2-letter code, e.g. 'FR', 'US', 'GB'
  arrivalAirport?: string;
  arrivalCountry?: string;   // ISO 2-letter code, e.g. 'FR', 'US', 'GB'
  operatingCarrier?: string;
  isEUOrUKCarrier?: boolean;  // True if operating airline holds EU/UK license (e.g. Air France, Lufthansa, BA, easyJet)
  jurisdictionCountry?: string; // 'FR' | 'UK' | 'DE' | 'ES' | 'IT' | 'BE' etc.
  flightDate?: string; // YYYY-MM-DD
  cancellationNoticeDays?: number; // Days of notice before scheduled departure
  isInvoluntaryDeniedBoarding?: boolean; // For denied boarding
}

export type ScopeStatus = 'covered' | 'not_covered' | 'insufficient_information';

export interface FlightEstimationResult {
  status: 'eligible' | 'not_eligible' | 'insufficient_information' | 'requires_verification';
  isPotentiallyEligible: boolean;
  estimatedAmountEuro: number;
  tier: 'short' | 'medium' | 'long' | 'none';
  distanceCategory: string;
  scopeStatus: ScopeStatus;
  scopeExplanation: string;
  prescriptionYears: number | null;
  prescriptionExplanation: string;
  qualificationText: string;
  legalBasis: string;
  disruptionNote: string;
  assumptions: string[];
}

// EU & UK Member State ISO country codes for EC 261 / UK 261 scope determination
const EU_UK_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR',
  'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO',
  'SE', 'SI', 'SK', 'GB', 'UK', 'CH', 'IS', 'NO'
]);

// Source-backed national limitation (prescription) periods
export const PRESCRIPTION_PERIODS: Record<string, { years: number; legalBasis: string }> = {
  FR: { years: 5, legalBasis: 'Code de commerce Art. L110-4 & Code civil Art. 2224 (Prescription quinquennale)' },
  UK: { years: 6, legalBasis: 'Limitation Act 1980 s. 5 (Dawson v Thomson Airways Ltd [2014])' },
  GB: { years: 6, legalBasis: 'Limitation Act 1980 s. 5 (Dawson v Thomson Airways Ltd [2014])' },
  DE: { years: 3, legalBasis: 'BGB § 195 (Prescription triennale calculée à compter du 31 décembre de l’année)' },
  ES: { years: 5, legalBasis: 'Código Civil Art. 1964 (Réforme de la prescription des actions personnelles)' },
  IT: { years: 2, legalBasis: 'Codice Civile Art. 2951 (Délai biennal en matière de transport)' },
  BE: { years: 1, legalBasis: 'Loi du 25 août 1891 / Code de droit économique Art. X.10 (Délai d’un an)' },
};

/**
 * Pure, deterministic legal scope assessment under EC 261 / UK 261 rules.
 */
export function determineGeographicScope(input: FlightEstimationInput): { scopeStatus: ScopeStatus; explanation: string } {
  const depCountry = input.departureCountry?.toUpperCase();
  const arrCountry = input.arrivalCountry?.toUpperCase();
  const isEuCarrier = input.isEUOrUKCarrier;

  // Case 1: Departure from EU/UK airport -> ALWAYS in scope regardless of operating carrier
  if (depCountry && EU_UK_COUNTRIES.has(depCountry)) {
    return {
      scopeStatus: 'covered',
      explanation: 'Vol au départ d’un aéroport situé dans l’Union européenne ou le Royaume-Uni (Règlement CE 261/2004 applicable sans condition de nationalité de la compagnie).',
    };
  }

  // Case 2: Arrival in EU/UK airport from outside EU/UK
  if (arrCountry && EU_UK_COUNTRIES.has(arrCountry)) {
    if (depCountry && !EU_UK_COUNTRIES.has(depCountry)) {
      if (isEuCarrier === true) {
        return {
          scopeStatus: 'covered',
          explanation: 'Vol vers l’UE/Royaume-Uni opéré par un transporteur communautaire/européen (Règlement CE 261/2004 applicable).',
        };
      } else if (isEuCarrier === false) {
        return {
          scopeStatus: 'not_covered',
          explanation: 'Vol en provenance d’un pays tiers opéré par une compagnie non-UE/UK (ex: Delta, United, Emirates). Ce vol est hors du champ d’application du Règlement CE 261/2004.',
        };
      } else {
        return {
          scopeStatus: 'insufficient_information',
          explanation: 'Vol en provenance d’un pays tiers vers l’UE : l’éligibilité dépend de la nationalité de la licence du transporteur effectif (ex: Air France = éligible, Delta = non éligible).',
        };
      }
    }
  }

  // Case 3: Both origin and destination outside EU/UK
  if (depCountry && arrCountry && !EU_UK_COUNTRIES.has(depCountry) && !EU_UK_COUNTRIES.has(arrCountry)) {
    return {
      scopeStatus: 'not_covered',
      explanation: 'Trajet s’effectuant intégralement hors du territoire de l’UE et du Royaume-Uni. Le Règlement CE 261/2004 ne s’applique pas.',
    };
  }

  // Default when geographic details are not provided: require explicit verification
  return {
    scopeStatus: 'insufficient_information',
    explanation: 'Informations d’aéroports ou de transporteur incomplètes. La vérification du lieu de départ et de la compagnie est requise pour confirmer le champ d’application.',
  };
}

/**
 * Main pure calculator function for Rights Radar.
 */
export function estimateFlightRights(input: FlightEstimationInput): FlightEstimationResult {
  const {
    distanceKm,
    delayHours,
    disruptionType,
    jurisdictionCountry = 'FR',
    cancellationNoticeDays,
    isInvoluntaryDeniedBoarding,
  } = input;

  const assumptions: string[] = [];

  // 1. Input Sanity Validation
  if (isNaN(distanceKm) || distanceKm <= 0 || isNaN(delayHours) || delayHours < 0) {
    return {
      status: 'insufficient_information',
      isPotentiallyEligible: false,
      estimatedAmountEuro: 0,
      tier: 'none',
      distanceCategory: 'Données invalides',
      scopeStatus: 'insufficient_information',
      scopeExplanation: 'Veuillez saisir une distance et un retard valides.',
      prescriptionYears: null,
      prescriptionExplanation: 'Inconnue',
      qualificationText: 'Données de vol incomplètes ou erronées.',
      legalBasis: 'Règlement (CE) n° 261/2004',
      disruptionNote: 'Vérifiez les valeurs saisies.',
      assumptions: ['Les paramètres doivent être des nombres positifs.'],
    };
  }

  // 2. Geographic Scope Assessment
  const { scopeStatus, explanation: scopeExplanation } = determineGeographicScope(input);

  if (scopeStatus === 'not_covered') {
    return {
      status: 'not_eligible',
      isPotentiallyEligible: false,
      estimatedAmountEuro: 0,
      tier: 'none',
      distanceCategory: `Vol de ${Math.round(distanceKm)} km`,
      scopeStatus,
      scopeExplanation,
      prescriptionYears: null,
      prescriptionExplanation: 'Non applicable',
      qualificationText: 'Vol hors du champ d’application du Règlement européen (CE) n° 261/2004.',
      legalBasis: 'Règlement (CE) n° 261/2004, Article 3 (Champ d’application)',
      disruptionNote: 'Aucune indemnisation forfaitaire européenne n’est exigible pour cet itinéraire.',
      assumptions,
    };
  }

  // 3. Limitation Period (Prescription)
  const normJurisdiction = jurisdictionCountry?.toUpperCase() || 'FR';
  const prescriptionData = PRESCRIPTION_PERIODS[normJurisdiction];
  const prescriptionYears = prescriptionData ? prescriptionData.years : null;
  const prescriptionExplanation = prescriptionData
    ? `${prescriptionData.years} ans (${prescriptionData.legalBasis})`
    : 'Délai de prescription spécifique à la juridiction à vérifier auprès d’un professionnel.';

  // 4. Disruption-Specific Eligibility Logic
  let isEligibleByDisruption = false;
  let disruptionNote = '';

  if (disruptionType === 'delay') {
    if (delayHours < 3) {
      return {
        status: 'not_eligible',
        isPotentiallyEligible: false,
        estimatedAmountEuro: 0,
        tier: 'none',
        distanceCategory: 'Retard inférieur à 3 heures',
        scopeStatus,
        scopeExplanation,
        prescriptionYears,
        prescriptionExplanation,
        qualificationText: 'Aucun droit indemnitaire forfaitaire pour les retards de moins de 3 heures à destination finale.',
        legalBasis: 'Règlement (CE) n° 261/2004, Arrêts Sturgeon (C-402/07) et Nelson (C-581/10) CJUE',
        disruptionNote: 'Seul un retard d’au moins 3 heures au toucher des roues à la destination finale ouvre droit à compensation.',
        assumptions: ["Calcul basé sur l’heure d'ouverture des portes à la destination finale."],
      };
    }
    isEligibleByDisruption = true;
    disruptionNote = `Retard constaté de ${delayHours}h à la destination finale (seuil de 3h franchi).`;
  } else if (disruptionType === 'cancellation') {
    if (cancellationNoticeDays !== undefined && cancellationNoticeDays >= 14) {
      return {
        status: 'not_eligible',
        isPotentiallyEligible: false,
        estimatedAmountEuro: 0,
        tier: 'none',
        distanceCategory: `Vol de ${Math.round(distanceKm)} km`,
        scopeStatus,
        scopeExplanation,
        prescriptionYears,
        prescriptionExplanation,
        qualificationText: 'Vol annulé avec un préavis d’au moins 14 jours avant le départ prévu.',
        legalBasis: 'Règlement (CE) n° 261/2004, Article 5 § 1 c) i)',
        disruptionNote: 'L’information transmise au moins 2 semaines avant le départ exonère le transporteur de l’obligation d’indemnisation forfaitaire.',
        assumptions: ['Un remboursement ou un réacheminement reste du au choix du passager.'],
      };
    }
    isEligibleByDisruption = true;
    disruptionNote = cancellationNoticeDays !== undefined
      ? `Annulation notifiée avec un préavis de ${cancellationNoticeDays} jour(s) (< 14 jours).`
      : 'Annulation tardive ou sans préavis suffisant.';
  } else if (disruptionType === 'denied_boarding') {
    if (isInvoluntaryDeniedBoarding === false) {
      return {
        status: 'not_eligible',
        isPotentiallyEligible: false,
        estimatedAmountEuro: 0,
        tier: 'none',
        distanceCategory: `Vol de ${Math.round(distanceKm)} km`,
        scopeStatus,
        scopeExplanation,
        prescriptionYears,
        prescriptionExplanation,
        qualificationText: 'Abandon volontaire de réservation (renoncement négocié).',
        legalBasis: 'Règlement (CE) n° 261/2004, Article 4 § 1',
        disruptionNote: 'Les passagers volontaires bénéficient des contreparties négociées avec la compagnie, mais non de l’indemnité légale automatique.',
        assumptions: ['Le renoncement volontaire exclut l’indemnité forfaitaire automatique.'],
      };
    }
    isEligibleByDisruption = true;
    disruptionNote = 'Refus d’embarquement involontaire (surbooking ou motif opérationnel non justifié).';
  }

  // 5. Compensation Distance Bands Calculation
  // Bracket 1: <= 1500 km -> 250 €
  if (distanceKm <= 1500) {
    return {
      status: scopeStatus === 'covered' ? 'eligible' : 'requires_verification',
      isPotentiallyEligible: true,
      estimatedAmountEuro: 250,
      tier: 'short',
      distanceCategory: 'Vol jusqu’à 1 500 km',
      scopeStatus,
      scopeExplanation,
      prescriptionYears,
      prescriptionExplanation,
      qualificationText: 'Montant possible estimé : 250 € par passager (sous réserve d’absence de circonstances extraordinaires exonératoires).',
      legalBasis: 'Règlement (CE) n° 261/2004, Article 7 § 1 a)',
      disruptionNote,
      assumptions,
    };
  }

  // Bracket 2: Intra-EU > 1500 km OR any flight 1500 km to 3500 km -> 400 €
  // Note: Only intra-EU flights genuinely > 1500 km qualify for 400 €
  const isIntraEU = input.departureCountry && input.arrivalCountry && EU_UK_COUNTRIES.has(input.departureCountry.toUpperCase()) && EU_UK_COUNTRIES.has(input.arrivalCountry.toUpperCase());

  if (isIntraEU || (distanceKm > 1500 && distanceKm <= 3500)) {
    return {
      status: scopeStatus === 'covered' ? 'eligible' : 'requires_verification',
      isPotentiallyEligible: true,
      estimatedAmountEuro: 400,
      tier: 'medium',
      distanceCategory: isIntraEU ? 'Vol intracommunautaire de plus de 1 500 km' : 'Vol de 1 500 à 3 500 km',
      scopeStatus,
      scopeExplanation,
      prescriptionYears,
      prescriptionExplanation,
      qualificationText: 'Montant possible estimé : 400 € par passager (sous réserve d’absence de circonstances extraordinaires exonératoires).',
      legalBasis: 'Règlement (CE) n° 261/2004, Article 7 § 1 b)',
      disruptionNote,
      assumptions,
    };
  }

  // Bracket 3: Extra-EU > 3500 km
  // Article 7(2)(c) & CJUE Sturgeon: 50% reduction (300 €) for delay between 3h and 4h on long-haul flights
  const isReducedDelay = disruptionType === 'delay' && delayHours >= 3 && delayHours < 4;
  const amount = isReducedDelay ? 300 : 600;

  if (isReducedDelay) {
    assumptions.push('Réduction de 50 % appliquée sous l’Art. 7 § 2 c) pour un retard compris entre 3h et 4h.');
  }

  return {
    status: scopeStatus === 'covered' ? 'eligible' : 'requires_verification',
    isPotentiallyEligible: true,
    estimatedAmountEuro: amount,
    tier: 'long',
    distanceCategory: 'Vol extracommunautaire de plus de 3 500 km',
    scopeStatus,
    scopeExplanation,
    prescriptionYears,
    prescriptionExplanation,
    qualificationText: `Montant possible estimé : ${amount} € par passager (${isReducedDelay ? 'réduction légale de 50 % pour retard entre 3h et 4h' : 'taux plein pour retard ≥ 4h ou annulation/surbooking'}).`,
    legalBasis: 'Règlement (CE) n° 261/2004, Article 7 § 1 c) & Article 7 § 2 c)',
    disruptionNote,
    assumptions,
  };
}

/**
 * Validates waitlist inputs.
 */
export function validateWaitlistInput(email: string, usageFrequency: string | null): { isValid: boolean; error?: string } {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { isValid: false, error: 'Veuillez saisir votre adresse email.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Veuillez saisir une adresse email valide (ex. nom@domaine.fr).' };
  }
  if (!usageFrequency) {
    return { isValid: false, error: 'Veuillez sélectionner votre fréquence d’usage envisagée.' };
  }
  return { isValid: true };
}

/**
 * Generates tailored, disruption-specific claim letter templates without false legal guarantees.
 */
export function generateClaimLetterTemplate(params: {
  passengerName: string;
  bookingRef?: string;
  flightCode: string;
  departureAirport: string;
  arrivalAirport: string;
  flightDate: string;
  delayHours?: number;
  disruptionType?: DisruptionType | 'general_inquiry';
  estimatedAmount?: number;
  airlineName: string;
  recipientContact?: string;
}): string {
  const {
    passengerName,
    bookingRef,
    flightCode,
    departureAirport,
    arrivalAirport,
    flightDate,
    delayHours = 3,
    disruptionType = 'delay',
    estimatedAmount = 250,
    airlineName,
  } = params;

  const safePassenger = passengerName?.trim() || '[Prénom et Nom du passager]';
  const safeAirline = airlineName?.trim() || 'la compagnie aérienne';
  const safePnr = bookingRef?.trim() || 'À préciser';

  let disruptionStatement = '';
  let legalReference = '';

  if (disruptionType === 'delay') {
    disruptionStatement = `Ce vol a subi un retard majeur d'au moins ${delayHours} heure(s) à l'arrivée effective à la destination finale (${arrivalAirport}).`;
    legalReference = `Conformément à la jurisprudence constante de la Cour de Justice de l'Union européenne (arrêts Sturgeon C-402/07 et Nelson C-581/10) interprétant les articles 5, 6 et 7 du Règlement (CE) n° 261/2004, ce retard ouvre droit à une indemnisation forfaitaire de ${estimatedAmount} € par passager.`;
  } else if (disruptionType === 'cancellation') {
    disruptionStatement = `Ce vol a été annulé par le transporteur sans préavis suffisant d'au moins 14 jours.`;
    legalReference = `En application des articles 5 et 7 du Règlement (CE) n° 261/2004, cette annulation non justifiée par des circonstances extraordinaires ouvre droit à une indemnité forfaitaire légale de ${estimatedAmount} € par passager.`;
  } else if (disruptionType === 'denied_boarding') {
    disruptionStatement = `J'ai fait l'objet d'un refus d'embarquement involontaire sur ce vol alors que je me suis présenté dans les délais requis muni d'une réservation confirmée.`;
    legalReference = `En application de l'article 4 et de l'article 7 du Règlement (CE) n° 261/2004, le refus d'embarquement involontaire donne lieu au versement immédiat d'une indemnité forfaitaire de ${estimatedAmount} € par passager.`;
  } else {
    disruptionStatement = `Je souhaite obtenir des clarifications officielles concernant la perturbation intervenue sur ce vol.`;
    legalReference = `Conformément au Règlement (CE) n° 261/2004, je sollicite la transmission du rapport circonstancié relatif à l'exploitation de ce vol.`;
  }

  return `À l'attention du Service Clientèle / Réclamations de ${safeAirline}

Objet : Demande de traitement amiable — Vol ${flightCode} du ${flightDate} (Référence dossier / PNR : ${safePnr})
Fondement : Règlement européen (CE) n° 261/2004

Madame, Monsieur,

Je vous contacte en qualité de passager du vol ${flightCode} reliant ${departureAirport} à ${arrivalAirport}, initialement prévu le ${flightDate}.

${disruptionStatement}

${legalReference}

Pour ce trajet, l'indemnité forfaitaire précitée s'élève à ${estimatedAmount} € par passager.

Je vous invite à procéder à l'examen de cette demande et au versement de la somme due (${estimatedAmount} €) par virement bancaire.

Je reste à votre disposition pour vous transmettre tout justificatif complémentaire (carte d'embarquement, attestation de retard).

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${safePassenger}
`;
}

export const generateClaimLetter = generateClaimLetterTemplate;
