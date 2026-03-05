# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 19 bilingual (Hungarian/English) website for Mitrik Hűtés - a climate control and heating company in Szeged, Hungary. Features SSR, SEO optimization, dark mode, GDPR cookie consent, and seasonal snowfall effects.

**Production**: https://mitrikhutes.hu

## Development Commands

```bash
# Start development server (defaults to http://localhost:4200/)
npm start

# Build for production
npm run build -- --configuration production

# Build with SSR support
npm run build:ssr

# Prerender static pages (SSR)
npm run prerender          # Development
npm run prerender:prod     # Production

# Run tests
npm test

# Watch mode for development
npm run watch
```

**Note**: Default route is `/hu` (Hungarian). Access English version at `/en`.

## Key Architecture

### Application Configuration

Located in `src/app/app.config.ts`:
- **Zone change detection**: Enabled with event coalescing for better performance
- **Router config**: `onSameUrlNavigation: 'reload'` allows navigation to same URL
- **Client hydration**: Enabled with `withEventReplay()` for progressive enhancement after SSR
- **HTTP client**: Configured with `withFetch()` for modern fetch API usage
- **PrimeNG theme**: Aura preset with `.my-app-dark` dark mode selector
- **Translation module**: Root-level configuration with Hungarian as default

### Routing & Language Handling

- **Route structure**: `/{lang}` where lang is `hu` (default) or `en`
- **Language priority**: Cookie preference > URL path > Browser language
- **Route guard**: `setLangGuard()` in `src/app/app.routes.ts` handles language switching and cookie-based redirects
- **Translation files**: `src/assets/i18n/hu.json` and `en.json`
- **Default language**: Hungarian (`hu`)
- **Translation loader**: Uses `TranslateHttpLoader` configured in `app.config.ts` to load JSON files from `assets/i18n/`

The route guard enforces cookie language preference - if a user has selected Hungarian but navigates to `/en`, they'll be automatically redirected to `/hu`. Only set cookie language when user explicitly changes it, not on every URL navigation.

**Important**: The guard only saves URL language to cookie if no cookie preference exists. This prevents overwriting user's explicit language choice when they visit a different language URL directly.

### Cookie & Preferences (CookieService)

Located in `src/app/services/cookie.service.ts`:
- **Language preference**: `setLanguage(lang)` / `getCookieLanguage()`
- **Theme preference**: `setTheme(isDark)` / `getCookieTheme()`
- **Storage strategy**: Cookie (if consent given) + localStorage (fallback)
- **GDPR consent**: `hasConsent()` / `saveConsent(preferences)` / `revokeConsent()`
- **Analytics**: Google Analytics (GA4: `G-X3LHYY28JP`) loaded only after user consent

### Web Vitals Service

Located in `src/app/services/web-vitals.service.ts`:
- **Metrics tracked**: CLS, LCP, INP, FCP, TTFB (note: FID has been deprecated in favor of INP)
- **Integration**: Sends Core Web Vitals to Google Analytics when available
- **Browser-only**: Uses `isPlatformBrowser()` check and dynamic import for SSR compatibility
- **Initialization**: Call `webVitalsService.initWebVitals()` after user consent

### Google Business Reviews Service

Located in `src/app/services/google-business-reviews.service.ts`:
- **Purpose**: Fetches real customer reviews from Google Business Profile
- **Caching**: 24-hour cache to minimize API calls
- **Integration**: Automatically generates review structured data for SEO
- **Setup**: See `GOOGLE_REVIEWS_SETUP.md` for complete configuration guide
- **Security**: API keys stored in environment files (gitignored)
- **Feature flag**: `environment.enableGoogleReviews` to toggle on/off

**Environment Configuration**:
- `src/environments/environment.ts` - Development config (gitignored)
- `src/environments/environment.prod.ts` - Production config (gitignored)
- `src/environments/environment.example.ts` - Template file (committed)

**IMPORTANT**: Never commit API keys. Use environment.example.ts as template.

### SEO Service

Located in `src/app/services/seo.service.ts`:
- **Structured data**: Generates FAQPage, LocalBusiness, HVACBusiness, Service, BreadcrumbList schemas
- **Review integration**: Automatically fetches and adds real Google Business reviews to structured data
- **Meta tags**: Updates Open Graph, Twitter Cards, hreflang tags
- **Canonical URLs**: Sets canonical links for each page
- **Base URL**: `https://mitrikhutes.hu`
- **Images**: Uses `logo.svg`, `climate-installation.jpg`, `maintenance.png`

Call `seoService.updateSEO(data)` in components to update page-level SEO metadata.

**Review Schema**: Only generated when real reviews are available from Google Business Profile API. Fake review data has been removed to comply with Google guidelines.

### Component Structure

- **Standalone components**: No NgModules, all components are standalone
- **Main layout**: `app.component.ts` renders `<router-outlet>` with cookie consent
- **Header**: `components/header/` - Navigation with language/theme toggle, mobile drawer, snowfall toggle (Dec 1 - Jan 31, dark mode only)
- **Home**: `components/home/` - Main page with service cards, FAQ section, contact form (EmailJS)
- **Footer**: `components/footer/`
- **Cookie Consent**: `components/cookie-consent/` - GDPR banner with granular controls
- **Not Found**: `components/not-found/` - 404 page

### Styling & UI

- **Tailwind CSS 4**: Utility-first styling in `src/styles.css` and component files
  - Uses `@tailwindcss/cli` and `@tailwindcss/postcss` for processing
  - PrimeUI plugin: `tailwindcss-primeui` for PrimeNG integration
- **PrimeNG 19**: Component library (Buttons, Cards, Drawer, Select, Toast, ScrollTop)
- **Theme**: Aura preset with dark mode support (`.my-app-dark` class)
  - Configured in `app.config.ts` via `providePrimeNG()`
  - Dark mode selector: `.my-app-dark` class on document element
- **Dark mode**: Toggle via header, persisted in cookie/localStorage
- **PrimeIcons**: Icon library for UI elements

### EmailJS Integration

Contact form in `home.component.ts` uses EmailJS for email handling. Service/template IDs are configured directly in the component code.

## Deployment

Automated via GitHub Actions (`.github/workflows/deploy.yml`):
1. Triggers on push to `master` branch
2. Builds with `--configuration production --base-href "/"`
3. Creates 404.html from index.html for SPA routing
4. Generates CNAME file with `mitrikhutes.hu`
5. Deploys to `gh-pages` branch

**Assets copied to build**:
- `sitemap.xml` and `robots.txt` to root
- `site.webmanifest` from `src/assets/` to root
- Translation files from `src/assets/i18n/` to `/assets/i18n/`
- `favicon.png` and all other assets

## Important Patterns

### Language Switching
When user changes language via header selector:
1. Call `cookieService.setLanguage(newLang)`
2. Navigate to `/{newLang}` route
3. Route guard will set translate service and update `<html lang="...">`

### Dark Mode
Theme toggle in header component:
1. Call `cookieService.setTheme(isDark)`
2. Add/remove `.my-app-dark` class on document element
3. PrimeNG theme automatically switches based on class

### Snowfall Feature
Seasonal effect using `let-it-go` library:
- Active period: December 1 - January 31
- Only works in dark mode (button hidden in light mode)
- Toggle button in header component

### Adding SEO to New Pages
```typescript
constructor(private seoService: SEOService) {}

ngOnInit() {
  this.seoService.updateSEO({
    title: 'Page Title',
    description: 'Page description',
    keywords: 'keyword1, keyword2',
    url: '/hu/page-path',
    locale: 'hu',
    alternateLocales: [
      { lang: 'hu', url: '/hu/page-path' },
      { lang: 'en', url: '/en/page-path' }
    ]
  });
}
```

## Prerendered Routes

Static pages generated during build (see `angular.json`):
- `/`, `/hu`, `/en`
- `/notfound`, `/hu/notfound`, `/en/notfound`

Add new routes to `prerender.routes` array in `angular.json`.

## Testing Considerations

- **Test framework**: Karma/Jasmine
- **Test configuration**: `tsconfig.spec.json` and `karma.conf.js`
- **Material theme**: Tests use `@angular/material/prebuilt-themes/azure-blue.css`
- **SSR-compatible code**: Always check `isPlatformBrowser(platformId)` before accessing browser APIs
- Cookie service methods handle SSR gracefully by returning defaults on server

## Performance & Optimization

- **Client hydration**: Enabled with event replay in `app.config.ts` for faster interactivity after SSR
- **HTTP client**: Uses `withFetch()` for improved performance
- **Bundle budgets** (production):
  - Initial bundle: 500kB warning, 1MB error (currently: 997KB)
  - Component styles: 4kB warning, 8kB error
- **Optimization features**:
  - Script minification
  - CSS minification with critical CSS inlining
  - Font inlining
  - Output hashing for cache busting
- **Review caching**: 24-hour cache for Google Business reviews (minimizes API calls)

## Third-Party Integrations

### Google Services
- **Analytics**: GA4 tracking (G-X3LHYY28JP) - loaded only with user consent
- **Places API**: Reviews fetched from Google Business Profile (optional, requires setup)
- **Fonts**: Google Fonts (Roboto) with preconnect optimization

### EmailJS
- Contact form integration in `home.component.ts`
- Service ID: `service_iv5svdv`
- Templates: `template_lgz5yv7` (main), `template_msr2hhd` (auto-reply)

## Security & API Keys

**CRITICAL**: Never commit API keys to version control!

- **Environment files**: `src/environments/*.ts` are gitignored (except .example.ts)
- **API key storage**: Use environment variables for Google Places API
- **Production**: Consider backend proxy for API calls (see `GOOGLE_REVIEWS_SETUP.md`)
- **Restrictions**: Always restrict API keys to specific domains and APIs

## Setup for New Developers

1. Clone repository
2. Install dependencies: `npm install`
3. Copy environment template: `cp src/environments/environment.example.ts src/environments/environment.ts`
4. (Optional) Configure Google Places API for reviews (see `GOOGLE_REVIEWS_SETUP.md`)
5. Start dev server: `npm start`
6. Access at `http://localhost:4200/hu`
