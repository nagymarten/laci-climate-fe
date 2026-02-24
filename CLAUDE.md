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

# Prerender static pages (SSR)
npm run prerender:prod

# Run tests
npm test

# Watch mode for development
npm run watch
```

## Key Architecture

### Routing & Language Handling

- **Route structure**: `/{lang}` where lang is `hu` (default) or `en`
- **Language priority**: Cookie preference > URL path > Browser language
- **Route guard**: `setLangGuard()` in `src/app/app.routes.ts` handles language switching and cookie-based redirects
- **Translation files**: `src/assets/i18n/hu.json` and `en.json`
- **Default language**: Hungarian (`hu`)

The route guard enforces cookie language preference - if a user has selected Hungarian but navigates to `/en`, they'll be automatically redirected to `/hu`. Only set cookie language when user explicitly changes it, not on every URL navigation.

### Cookie & Preferences (CookieService)

Located in `src/app/services/cookie.service.ts`:
- **Language preference**: `setLanguage(lang)` / `getCookieLanguage()`
- **Theme preference**: `setTheme(isDark)` / `getCookieTheme()`
- **Storage strategy**: Cookie (if consent given) + localStorage (fallback)
- **GDPR consent**: `hasConsent()` / `saveConsent(preferences)` / `revokeConsent()`
- **Analytics**: Google Analytics (GA4: `G-X3LHYY28JP`) loaded only after user consent

### SEO Service

Located in `src/app/services/seo.service.ts`:
- **Structured data**: Generates FAQPage, LocalBusiness, and HVACBusiness schemas
- **Meta tags**: Updates Open Graph, Twitter Cards, hreflang tags
- **Canonical URLs**: Sets canonical links for each page
- **Base URL**: `https://mitrikhutes.hu`

Call `seoService.updateSEO(data)` in components to update page-level SEO metadata.

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
- **PrimeNG 19**: Component library (Buttons, Cards, Drawer, Select, Toast, ScrollTop)
- **Theme**: Aura preset with dark mode support (`.my-app-dark` class)
- **Dark mode**: Toggle via header, persisted in cookie/localStorage

### EmailJS Integration

Contact form in `home.component.ts` uses EmailJS for email handling. Service/template IDs are configured directly in the component code.

## Deployment

Automated via GitHub Actions (`.github/workflows/deploy.yml`):
1. Triggers on push to `master` branch
2. Builds with `--configuration production --base-href "/"`
3. Creates 404.html from index.html for SPA routing
4. Generates CNAME file with `mitrikhutes.hu`
5. Deploys to `gh-pages` branch

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

- Tests run via Karma/Jasmine
- SSR-compatible code: Always check `isPlatformBrowser(platformId)` before accessing browser APIs
- Cookie service methods handle SSR gracefully by returning defaults on server
