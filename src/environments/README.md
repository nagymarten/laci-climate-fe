# Environment Configuration

This directory contains environment-specific configuration files.

## ⚠️ SECURITY WARNING

**NEVER commit files with real API keys to Git!**

Files in this directory are gitignored to prevent accidental commits.

## Setup Instructions

### 1. Create Environment Files

```bash
# Copy example file for development
cp environment.example.ts environment.ts

# Copy example file for production
cp environment.example.ts environment.prod.ts
```

### 2. Configure API Keys

Edit `environment.ts` and `environment.prod.ts` with your actual values:

```typescript
export const environment = {
  production: false, // or true for prod
  googlePlaceId: "ChIJ...",        // Your actual Place ID
  googleApiKey: "AIza...",         // Your actual API Key
  enableGoogleReviews: true,       // Enable after setup
};
```

### 3. Verify .gitignore

Ensure these files are in `.gitignore`:
```
/src/environments/environment.ts
/src/environments/environment.prod.ts
```

## Files

- `environment.example.ts` - Template file (safe to commit)
- `environment.ts` - Development config (GITIGNORED)
- `environment.prod.ts` - Production config (GITIGNORED)
- `README.md` - This file

## Getting API Credentials

See `GOOGLE_REVIEWS_SETUP.md` in the project root for detailed instructions.

## Troubleshooting

### "Cannot find module './environments/environment'"

You need to create `environment.ts`:
```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

### API Keys Not Working

1. Check API key restrictions in Google Cloud Console
2. Ensure Places API is enabled
3. Verify domain is whitelisted
4. Check `enableGoogleReviews` flag is `true`

## Production Deployment

**RECOMMENDED**: Use backend proxy instead of frontend API keys.

See `GOOGLE_REVIEWS_SETUP.md` > "Production Best Practices" section.
