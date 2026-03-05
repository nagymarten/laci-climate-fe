import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../environments/environment";

/**
 * Google Business Profile Review Integration Service
 *
 * This service fetches real reviews from Google Business Profile
 * to display on your website and generate proper structured data.
 *
 * SETUP INSTRUCTIONS:
 * ===================
 *
 * 1. Get your Google Place ID:
 *    - Go to: https://developers.google.com/maps/documentation/places/web-service/place-id
 *    - Search for "Mitrik Hűtés Szeged"
 *    - Copy the Place ID (format: ChIJ...)
 *
 * 2. Enable Google Places API:
 *    - Go to Google Cloud Console: https://console.cloud.google.com/
 *    - Create a new project or select existing
 *    - Enable "Places API (New)"
 *    - Create API credentials (API Key)
 *    - Restrict the API key to your domain (mitrikhutes.hu)
 *
 * 3. Set up environment variables:
 *    - Add to src/environments/environment.ts:
 *      export const environment = {
 *        production: false,
 *        googlePlaceId: 'YOUR_PLACE_ID_HERE',
 *        googleApiKey: 'YOUR_API_KEY_HERE'
 *      };
 *
 * 4. Install HttpClient (already configured in app.config.ts)
 *
 * 5. Call this service in home.component.ts:
 *    constructor(private reviewService: GoogleBusinessReviewsService) {}
 *    ngOnInit() {
 *      this.reviewService.getReviews().subscribe(reviews => {
 *        console.log('Reviews:', reviews);
 *      });
 *    }
 *
 * ALTERNATIVE: Server-side approach (recommended for production)
 * ===============================================================
 * To avoid exposing API keys in frontend:
 * 1. Create a backend endpoint (Node.js/Express, PHP, etc.)
 * 2. Store API key server-side
 * 3. Create endpoint: GET /api/reviews
 * 4. Update this service to call your backend instead
 * 5. Cache reviews server-side (refresh every 24 hours)
 */

export interface GoogleReview {
  authorName: string;
  authorUrl?: string;
  language: string;
  profilePhotoUrl?: string;
  rating: number; // 1-5
  relativeTimeDescription: string;
  text: string;
  time: number; // Unix timestamp
  createTime?: string; // ISO 8601 format
}

export interface GooglePlaceDetails {
  placeId: string;
  name: string;
  rating: number; // Average rating
  userRatingsTotal: number;
  reviews: GoogleReview[];
}

@Injectable({
  providedIn: "root",
})
export class GoogleBusinessReviewsService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // Load from environment variables
  private readonly PLACE_ID = environment.googlePlaceId;
  private readonly API_KEY = environment.googleApiKey;
  private readonly ENABLED = environment.enableGoogleReviews;

  // Cache reviews to reduce API calls
  private cachedReviews: GoogleReview[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Fetch reviews from Google Places API
   * Uses caching to minimize API calls
   */
  getReviews(): Observable<GoogleReview[]> {
    if (!isPlatformBrowser(this.platformId) || !this.ENABLED) {
      return of([]);
    }

    // Return cached reviews if still valid
    const now = Date.now();
    if (
      this.cachedReviews &&
      now - this.cacheTimestamp < this.CACHE_DURATION
    ) {
      return of(this.cachedReviews);
    }

    // TODO: Replace with your backend endpoint for production
    // Example: return this.http.get<GoogleReview[]>('/api/reviews');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.PLACE_ID}&fields=name,rating,user_ratings_total,reviews&key=${this.API_KEY}`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.status === "OK" && response.result.reviews) {
          const reviews = response.result.reviews.map((review: any) => ({
            authorName: review.author_name,
            authorUrl: review.author_url,
            language: review.language,
            profilePhotoUrl: review.profile_photo_url,
            rating: review.rating,
            relativeTimeDescription: review.relative_time_description,
            text: review.text,
            time: review.time,
            createTime: new Date(review.time * 1000).toISOString(),
          }));

          // Cache the reviews
          this.cachedReviews = reviews;
          this.cacheTimestamp = now;

          return reviews;
        }
        return [];
      }),
      catchError((error) => {
        console.error("Failed to fetch Google Business reviews:", error);
        return of([]);
      })
    );
  }

  /**
   * Get place details including overall rating
   */
  getPlaceDetails(): Observable<GooglePlaceDetails | null> {
    if (!isPlatformBrowser(this.platformId) || !this.ENABLED) {
      return of(null);
    }

    // TODO: Replace with your backend endpoint for production
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.PLACE_ID}&fields=place_id,name,rating,user_ratings_total,reviews&key=${this.API_KEY}`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.status === "OK") {
          const result = response.result;
          return {
            placeId: result.place_id,
            name: result.name,
            rating: result.rating,
            userRatingsTotal: result.user_ratings_total,
            reviews: result.reviews?.map((review: any) => ({
              authorName: review.author_name,
              authorUrl: review.author_url,
              language: review.language,
              profilePhotoUrl: review.profile_photo_url,
              rating: review.rating,
              relativeTimeDescription: review.relative_time_description,
              text: review.text,
              time: review.time,
              createTime: new Date(review.time * 1000).toISOString(),
            })) || [],
          };
        }
        return null;
      }),
      catchError((error) => {
        console.error("Failed to fetch place details:", error);
        return of(null);
      })
    );
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cachedReviews = null;
    this.cacheTimestamp = 0;
  }
}
