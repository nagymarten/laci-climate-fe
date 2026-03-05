# Google Business Reviews Integration Guide

This guide helps you integrate real Google Business Profile reviews into your website.

---

## 🎯 Overview

The website now supports displaying real Google Business reviews with:
- Automatic structured data (Schema.org) generation
- Review caching (24-hour refresh)
- SSR-compatible implementation
- Secure API key management

---

## 📋 Prerequisites

1. **Google Business Profile** - Ensure "Mitrik Hűtés" has a verified Google Business Profile
2. **Google Cloud Account** - Free tier is sufficient
3. **Active reviews** - At least 3-5 reviews for best SEO impact

---

## 🔧 Setup Instructions

### Step 1: Find Your Google Place ID

1. Go to [Google Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
2. Search for: **"Mitrik Hűtés Szeged"**
3. Click on the business marker
4. Copy the **Place ID** (format: `ChIJ...`)

**Example**: `ChIJVVVVVVVVVIYRXXXXXXXXXX`

---

### Step 2: Enable Google Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Navigate to **APIs & Services > Library**
4. Search for **"Places API"** (or "Places API (New)")
5. Click **Enable**

---

### Step 3: Create API Key

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the API key immediately
4. Click **Restrict Key** (important for security!)

#### API Key Restrictions:

**Application restrictions:**
- Select: **HTTP referrers (websites)**
- Add referrers:
  - `http://localhost:4200/*` (for development)
  - `https://mitrikhutes.hu/*` (for production)

**API restrictions:**
- Select: **Restrict key**
- Choose: **Places API**
- Save

---

### Step 4: Configure Environment Variables

#### Development (`src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  googlePlaceId: "YOUR_PLACE_ID_HERE", // Paste from Step 1
  googleApiKey: "YOUR_API_KEY_HERE",   // Paste from Step 3
  enableGoogleReviews: true,            // Set to true
};
```

#### Production (`src/environments/environment.prod.ts`):

**⚠️ SECURITY WARNING**: Never commit API keys to Git!

**Option A - Frontend (Quick but less secure):**
```typescript
export const environment = {
  production: true,
  googlePlaceId: "YOUR_PLACE_ID",
  googleApiKey: "YOUR_API_KEY",
  enableGoogleReviews: true,
};
```

**Option B - Backend (RECOMMENDED):**
See "Production Best Practices" below.

---

### Step 5: Test the Integration

1. Start development server:
   ```bash
   npm start
   ```

2. Open browser console (F12)

3. Navigate to homepage

4. Check for reviews in console:
   ```
   Reviews: [
     { authorName: "John Doe", rating: 5, text: "..." },
     ...
   ]
   ```

5. View page source and search for `"@type": "Review"` to confirm structured data

---

## 🔒 Production Best Practices

### Recommended: Backend Proxy Approach

Instead of exposing API keys in frontend, create a backend endpoint:

#### Example: Node.js/Express Backend

```javascript
// backend/routes/reviews.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const PLACE_ID = process.env.GOOGLE_PLACE_ID;
const API_KEY = process.env.GOOGLE_API_KEY;

// Cache reviews for 24 hours
let cachedReviews = null;
let cacheTime = 0;

router.get('/api/reviews', async (req, res) => {
  const now = Date.now();
  const CACHE_DURATION = 24 * 60 * 60 * 1000;

  if (cachedReviews && (now - cacheTime < CACHE_DURATION)) {
    return res.json(cachedReviews);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${API_KEY}`;

    const response = await axios.get(url);

    if (response.data.status === 'OK') {
      const data = {
        reviews: response.data.result.reviews || [],
        rating: response.data.result.rating,
        totalReviews: response.data.result.user_ratings_total
      };

      cachedReviews = data;
      cacheTime = now;

      res.json(data);
    } else {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

#### Update Frontend Service

Modify `google-business-reviews.service.ts`:

```typescript
getReviews(): Observable<GoogleReview[]> {
  // Call your backend instead of Google API directly
  return this.http.get<any>('/api/reviews').pipe(
    map(response => response.reviews),
    catchError(() => of([]))
  );
}
```

---

## 🧪 Testing Checklist

- [ ] Reviews appear in browser console
- [ ] Structured data validates at [Schema.org Validator](https://validator.schema.org/)
- [ ] Google Rich Results Test shows review stars: [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Reviews update when cache expires (24 hours)
- [ ] SSR works correctly (check page source)
- [ ] API key restrictions work (test from unauthorized domain)

---

## 🐛 Troubleshooting

### No reviews appearing

1. **Check console for errors**
   - Network tab in DevTools
   - Look for 403/401 errors (API key issue)

2. **Verify API key restrictions**
   - Ensure domain is whitelisted
   - Check API is enabled in Cloud Console

3. **Verify Place ID**
   - Test Place ID at [Place Details API](https://developers.google.com/maps/documentation/places/web-service/details)

4. **Check enableGoogleReviews flag**
   - Ensure it's set to `true` in environment.ts

### CORS errors

- This means you're calling Google API directly from frontend
- Switch to backend proxy approach (see Production Best Practices)

### Reviews not in structured data

- Check SEO service is calling `addReviewSchema()`
- Verify reviews Observable is completing
- Look for `<script type="application/ld+json">` in page source

---

## 📊 Monitoring

### Google Search Console

1. Go to [Search Console](https://search.google.com/search-console)
2. Check **Enhancements > Reviews**
3. Monitor for structured data errors

### Analytics

Reviews are automatically tracked via Web Vitals service. Check Google Analytics for:
- Review display rate
- User engagement with review section

---

## 💰 Costs

Google Places API pricing (as of 2025):
- **Basic Data**: $17 per 1,000 requests
- **Free tier**: $200 monthly credit (≈11,750 requests/month)

**Your usage estimate**:
- Cached for 24 hours
- ~30 requests/month for homepage
- **Cost**: FREE (well within free tier)

---

## 🔐 Security Checklist

- [ ] Environment files added to .gitignore
- [ ] API key restricted to specific domains
- [ ] API key restricted to Places API only
- [ ] Using backend proxy (recommended for production)
- [ ] HTTPS enabled on production domain
- [ ] Regular API key rotation (every 90 days)

---

## 📚 Additional Resources

- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Schema.org Reviews](https://schema.org/Review)
- [Google Rich Results Guide](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)

---

## 🆘 Support

If you need help:
1. Check the troubleshooting section above
2. Review Google Cloud Console logs
3. Test API key at [API Key Tester](https://developers.google.com/maps/documentation/javascript/get-api-key)

---

**Last Updated**: 2026-03-05
