import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  private readonly COOKIE_CONSENT_KEY = 'cookie_consent';
  private readonly COOKIE_PREFERENCES_KEY = 'cookie_preferences';

  /**
   * Check if user has given cookie consent
   */
  hasConsent(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return localStorage.getItem(this.COOKIE_CONSENT_KEY) === 'true';
  }

  /**
   * Get user's cookie preferences
   */
  getPreferences(): CookiePreferences {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        necessary: true,
        analytics: false,
        marketing: false,
      };
    }

    const stored = localStorage.getItem(this.COOKIE_PREFERENCES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.getDefaultPreferences();
      }
    }
    return this.getDefaultPreferences();
  }

  /**
   * Save cookie consent and preferences
   */
  saveConsent(preferences: CookiePreferences): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(this.COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(
      this.COOKIE_PREFERENCES_KEY,
      JSON.stringify(preferences)
    );

    // Apply preferences immediately
    this.applyPreferences(preferences);
  }

  /**
   * Revoke consent (for testing or user request)
   */
  revokeConsent(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(this.COOKIE_CONSENT_KEY);
    localStorage.removeItem(this.COOKIE_PREFERENCES_KEY);

    // Remove analytics cookies
    this.removeAnalyticsCookies();
  }

  /**
   * Apply cookie preferences (load/unload scripts)
   */
  private applyPreferences(preferences: CookiePreferences): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (preferences.analytics) {
      this.loadAnalytics();
    } else {
      this.removeAnalyticsCookies();
    }

    if (preferences.marketing) {
      // Load marketing scripts if needed
      // this.loadMarketing();
    } else {
      // Remove marketing cookies if needed
      // this.removeMarketingCookies();
    }
  }

  /**
   * Load Google Analytics if consent given
   */
  private loadAnalytics(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check if GA is already loaded
    if (this.document.querySelector('script[src*="googletagmanager"]')) {
      return;
    }

    // Get GA ID from environment or config
    // For now, we'll use a placeholder - replace with actual GA ID
    const gaId = this.getGoogleAnalyticsId();
    if (!gaId) {
      return;
    }

    // Load gtag.js
    const script1 = this.document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    this.document.head.appendChild(script1);

    // Initialize GA
    const script2 = this.document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', {
        'anonymize_ip': true,
        'cookie_flags': 'SameSite=None;Secure'
      });
    `;
    this.document.head.appendChild(script2);
  }

  /**
   * Remove analytics cookies
   */
  private removeAnalyticsCookies(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Remove Google Analytics cookies
    const cookiesToRemove = [
      '_ga',
      '_ga_',
      '_gid',
      '_gat',
      '_gat_gtag_',
      '_gcl_au',
    ];

    const domain = this.document.location.hostname;
    const path = '/';

    cookiesToRemove.forEach((cookieName) => {
      // Remove for current domain
      this.deleteCookie(cookieName, path, domain);
      // Remove for .domain (subdomain cookies)
      this.deleteCookie(cookieName, path, '.' + domain);
    });

    // Remove GA scripts
    const scripts = this.document.querySelectorAll(
      'script[src*="googletagmanager"], script[src*="google-analytics"]'
    );
    scripts.forEach((script) => script.remove());
  }

  /**
   * Delete a cookie
   */
  private deleteCookie(name: string, path: string, domain: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Set cookie with past expiration date
    this.document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
    this.document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
  }

  /**
   * Get Google Analytics ID from environment or meta tag
   */
  private getGoogleAnalyticsId(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    // Check for meta tag with GA ID
    const metaTag = this.document.querySelector('meta[name="google-analytics-id"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }

    // Check for existing gtag config
    const scripts = this.document.querySelectorAll('script');
    for (const script of Array.from(scripts)) {
      if (script.innerHTML.includes("gtag('config'")) {
        const match = script.innerHTML.match(/gtag\('config',\s*'([^']+)'/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }

    return null;
  }

  /**
   * Get default cookie preferences
   */
  private getDefaultPreferences(): CookiePreferences {
    return {
      necessary: true, // Always true, cannot be disabled
      analytics: false,
      marketing: false,
    };
  }

  /**
   * Set a cookie
   */
  setCookie(name: string, value: string, days: number = 365): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    this.document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }

  /**
   * Get a cookie
   */
  getCookie(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const nameEQ = name + '=';
    const ca = this.document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }
}

