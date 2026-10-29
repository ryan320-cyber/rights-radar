# Site Notes — Rights Radar (Architecture, Revue Juridique, Firebase & Assurance Qualité)

Ce document consigne l'ensemble des éléments techniques, des choix d'architecture, des points soumis à vérification réglementaire, de l'intégration Firebase et des résultats des tests de validation pour le projet **Rights Radar**.

---

## 1. Vue d'ensemble du Projet & Philosophie « Local-First »
Rights Radar est une application web en français, souveraine et locale d'abord (*local-first*), conçue pour :
1. Détecter les perturbations de vol éligibles (retard >= 3h, annulation, refus d'embarquement).
2. Calculer le montant d'indemnisation forfaitaire selon le barème officiel du Règlement (CE) n° 261/2004 (250 €, 400 €, 600 €).
3. Générer des courriers de mise en demeure personnalisés et factuels, sans fausse garantie ni promesse trompeuse.
4. Suivre les délais de prescription nationaux (France : 5 ans, Belgique : 1 an, Allemagne : 3 ans, Espagne : 5 ans, Royaume-Uni : 6 ans).
5. Préserver l'intimité numérique : aucun email de réservation ni pièce justificative ne quitte le navigateur de l'usager sans son consentement explicite.

---

## 2. Éléments Soumis à Vérification [À VÉRIFIER] & Revue Éditoriale

| Identifiant | Énoncé / Revendication | Statut dans la version Staging (`rights-radar-site.html` et React) | Traitement dans la version Publication (`rights-radar-site-publish.html`) | Justification et Preuves Requises |
|---|---|---|---|---|
| **REF-REV-01** | *« accord provisoire annoncé en juin 2026 »* concernant la révision du règlement (CE) n° 261/2004. | Marqué avec l'attribut `data-review="true"`, affiché avec badge ambre uniquement en mode relecture (`?review=1`). | Supprimé et remplacé par la formulation factuelle certifiée : *« Les institutions européennes examinent la modernisation du cadre d'indemnisation du règlement (CE) n° 261/2004... »*. | Nécessite la publication formelle d'un texte de compromis au Journal officiel de l'Union européenne ou un communiqué conjoint officiel du Conseil et du Parlement. |
| **REF-REV-02** | *« Statistique de 45 % de non-recours »* (Transport Focus 2026). | Maintenu avec la mention obligatoire : `[organisme public] (trains, pas avions)`. | Maintenu avec la même attribution explicite pour éviter tout amalgame avec les passagers aériens. | L'étude porte sur les passagers ferroviaires britanniques. Elle est citée pour documenter le phénomène cognitif de non-recours sans extrapoler de fausses preuves au secteur aérien. |
| **REF-REV-03** | *« Tarifs concurrentiels de 35 % à 50 % de commission »* (AirHelp). | Tagué `[partie intéressée : AirHelp]` et qualifié d'*« Exemple de calcul, pas un résultat »*. | Maintenu avec la qualification d'exemple de simulation. | Les conditions générales de vente des agences commerciales doivent être auditées périodiquement pour refléter les variations selon la phase amiable ou contentieuse. |
| **REF-REV-04** | *« Hypothèse Rights Radar à 9 à 14 € de forfait fixe »*. | Tagué `[hypothèse à tester]`. | Maintenu sous forme d'hypothèse d'étude tarifaire. | Cette tarification dépendra des retours formulés par les répondants de la liste d'attente (question d'usage). |

---

## 3. Architecture Technique & Intégration Firebase

### A. Stack Technologique
- **Frontend SPA** : React 19 (`^19.0.1`), TypeScript (`^7.0.2`), Vite (`^8.3.0`), Tailwind CSS v4 (`^4.3.3`), Motion (`^12.23.24`), Three.js (`^0.186.1`), Lucide React.
- **Backend Fullstack** : Node.js, Express (`^4.21.2`), Google GenAI SDK (`@google/genai ^2.4.0`) avec Search Grounding (`gemini-3.8-flash`), Drizzle ORM (`^0.45.4`).
- **Firebase Client SDK (`firebase ^13.1.0`)** :
  - **Firebase Auth** : Authentification Google via `signInWithPopup(auth, googleProvider)`.
  - **Cloud Firestore** : Base NoSQL temps réel avec `firestoreDatabaseId` dédié (`ai-studio-remixrightsradar-66a5912e-da24-4137-bcb9-a47dbdeb49fa`).
  - Collections actives :
    - `/users/{userId}` : Profils utilisateurs synchronisés.
    - `/waitlist_submissions/{submissionId}` : Inscriptions à la liste d'attente et réponses d'enquête.
    - `/inspections/{inspectionId}` : Analyses de vol enregistrées et suivi des réclamations.
- **Firebase Admin SDK (`firebase-admin ^14.5.0`)** : Vérification des jetons d'authentification Bearer côté serveur via `src/middleware/auth.ts`.
- **Règles de Sécurité (`firestore.rules`)** : Spécification Zero-Trust ABAC interdisant tout accès non autorisé, validant la forme des identifiants et limitant la lecture des inscriptions waitlist à l'administrateur.

---

## 4. Résultats des Tests et Validation QA

### A. Tests Unitaires Logiques (Node built-in runner `tsx --test`)
- **Commande** : `npm test`
- **Résultat** : **21 / 21 tests réussis (PASS), 0 échec**
  1. *extractAirlineName detects airlines from headers correctly* : PASS
  2. *scanGmailFlightReceipts never returns fictitious demo records on empty or failed scans* : PASS
  3. *Sanity validation: invalid or negative inputs return insufficient information* : PASS
  4. *Geographic Scope: Departing EU/UK is ALWAYS covered under EC 261 / UK 261* : PASS
  5. *Geographic Scope: Arriving in EU from non-EU on non-EU carrier is NOT covered (Delta JFK -> CDG)* : PASS
  6. *Geographic Scope: Arriving in EU from non-EU on EU carrier IS covered (Air France JFK -> CDG)* : PASS
  7. *Delay Compensation: < 3 hours gives 0 EUR* : PASS
  8. *Delay Compensation: <= 1500 km with >= 3h delay yields 250 EUR* : PASS
  9. *Delay Compensation: Intra-EU > 1500 km or 1500-3500 km yields 400 EUR* : PASS
  10. *Delay Compensation: Extra-EU > 3500 km with 3h-4h delay applies 50% reduction (300 EUR)* : PASS
  11. *Delay Compensation: Extra-EU > 3500 km with >= 4h delay yields full 600 EUR* : PASS
  12. *Cancellation: Notice >= 14 days is NOT eligible for compensation* : PASS
  13. *Cancellation: Notice < 14 days IS eligible for compensation* : PASS
  14. *Denied Boarding: Voluntary surrender is NOT eligible for automatic EC 261 compensation* : PASS
  15. *Denied Boarding: Involuntary denied boarding IS eligible* : PASS
  16. *Prescription periods respect verified national legislation and handle unknown jurisdiction* : PASS
  17. *Claim letter generation provides disruption-specific templates without false guarantees* : PASS
  18. *validateEmail checks email formatting correctly* : PASS
  19. *submitWaitlist requires valid email and frequency* : PASS
  20. *submitWaitlist handles network errors and non-2xx responses without false success* : PASS
  21. *submitWaitlist returns success only when backend confirms 201 created* : PASS

### B. Contrôle Statique TypeScript (`npm run lint`)
- **Commande** : `tsc --noEmit`
- **Résultat** : **0 erreurs (Code de sortie 0)**.

### C. Compilation du Bundle de Production (`npm run build`)
- **Commande** : `vite build`
- **Résultat** : **Succès total en 1.50s (2116 modules transformés)**.
  - `dist/index.html` (1.25 kB)
  - `dist/assets/index-*.css` (72.33 kB)
  - `dist/assets/index-*.js` (1.63 MB)

---

## 5. Livrables Fournis dans le Répertoire du Projet

1. `src/` : Application complète React 19 + TypeScript + Vite + Firebase (Sections S0 à S9, radar interactif, simulateur de réclamations, auth Google et persistance Firestore).
2. `rights-radar-site.html` : Version autonome Staging complète intégrant les indicateurs de relecture (`?review=1`).
3. `rights-radar-site-publish.html` : Version autonome de Publication nettoyée de tout indicateur de relecture et revendication non certifiée.
4. `site-notes.md` : Ce rapport détaillé d'architecture, motion design et vérification.
5. `firebase-blueprint.json`, `security_spec.md`, `firestore.rules`, `firebase-applet-config.json` : Configuration Firestore sécurisée et déployée.
6. `server.ts` & `server.test.ts` : Serveur Express avec Google Search Grounding (`gemini-3.8-flash`) pour la vérification factuelle des incidents et la veille réglementaire en direct.
