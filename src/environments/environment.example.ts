/**
 * Example Environment Configuration
 *
 * SETUP:
 * 1. Copy this file to environment.ts
 * 2. Fill in your actual values
 * 3. DO NOT commit environment.ts to Git!
 */

export const environment = {
  production: false,

  // Google Business Profile Integration
  // See GOOGLE_REVIEWS_SETUP.md for detailed instructions
  googlePlaceId: "YOUR_GOOGLE_PLACE_ID_HERE", // e.g., ChIJ...
  googleApiKey: "YOUR_GOOGLE_API_KEY_HERE",   // From Google Cloud Console

  // API Configuration
  apiUrl: "http://localhost:4200",

  // Feature Flags
  enableGoogleReviews: false, // Set to true after configuring credentials
};
