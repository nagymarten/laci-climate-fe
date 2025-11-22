import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url: string;
  type?: string;
  locale?: string;
  alternateLocales?: { lang: string; url: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class SEOService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);
  private translate = inject(TranslateService);

  private readonly baseUrl = 'https://mitrikhutes.hu';
  private readonly defaultImage = 'https://mitrikhutes.hu/assets/og-cover.jpg';

  updateSEO(data: SEOData): void {
    const lang = data.locale || 'hu';
    const fullUrl = `${this.baseUrl}${data.url}`;

    // Update page title
    this.title.setTitle(data.title);

    // Update or create meta tags
    this.updateMetaTag('description', data.description);
    this.updateMetaTag('author', 'Mitrik Hűtés');
    if (data.keywords) {
      this.updateMetaTag('keywords', data.keywords);
    }

    // Canonical URL
    this.updateCanonicalLink(fullUrl);

    // Hreflang tags
    this.updateHreflangTags(data.alternateLocales || []);

    // Open Graph tags
    this.updateOpenGraphTags({
      title: data.title,
      description: data.description,
      url: fullUrl,
      image: data.image || this.defaultImage,
      type: data.type || 'website',
      locale: this.getLocaleCode(lang),
    });

    // Twitter Card tags
    this.updateTwitterTags({
      title: data.title,
      description: data.description,
      image: data.image || this.defaultImage,
    });

    // Update HTML lang attribute
    this.document.documentElement.lang = lang;

    // Update structured data
    this.updateStructuredData(lang, fullUrl);
  }

  private updateMetaTag(name: string, content: string): void {
    if (this.meta.getTag(`name="${name}"`)) {
      this.meta.updateTag({ name, content });
    } else {
      this.meta.addTag({ name, content });
    }
  }

  private updateCanonicalLink(url: string): void {
    let canonical = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = url;
    } else {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', url);
      this.document.head.appendChild(canonical);
    }
  }

  private updateHreflangTags(alternates: { lang: string; url: string }[]): void {
    // Remove existing hreflang tags
    const existing = this.document.querySelectorAll('link[rel="alternate"][hreflang]');
    existing.forEach((tag) => tag.remove());

    // Add new hreflang tags
    alternates.forEach((alt) => {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', alt.lang);
      link.setAttribute('href', `${this.baseUrl}${alt.url}`);
      this.document.head.appendChild(link);
    });

    // Add x-default
    const defaultLink = this.document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', `${this.baseUrl}/hu`);
    this.document.head.appendChild(defaultLink);
  }

  private updateOpenGraphTags(data: {
    title: string;
    description: string;
    url: string;
    image: string;
    type: string;
    locale: string;
  }): void {
    const ogTags = [
      { property: 'og:title', content: data.title },
      { property: 'og:description', content: data.description },
      { property: 'og:url', content: data.url },
      { property: 'og:image', content: data.image },
      { property: 'og:type', content: data.type },
      { property: 'og:locale', content: data.locale },
      { property: 'og:site_name', content: 'Mitrik Hűtés' },
    ];

    ogTags.forEach((tag) => {
      if (this.meta.getTag(`property="${tag.property}"`)) {
        this.meta.updateTag(tag);
      } else {
        this.meta.addTag(tag);
      }
    });

    // Add alternate locales
    this.meta.updateTag({ property: 'og:locale:alternate', content: 'en_GB' });
  }

  private updateTwitterTags(data: {
    title: string;
    description: string;
    image: string;
  }): void {
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: data.title },
      { name: 'twitter:description', content: data.description },
      { name: 'twitter:image', content: data.image },
    ];

    twitterTags.forEach((tag) => {
      if (this.meta.getTag(`name="${tag.name}"`)) {
        this.meta.updateTag(tag);
      } else {
        this.meta.addTag(tag);
      }
    });
  }

  private updateStructuredData(lang: string, url: string): void {
    // Remove existing structured data scripts
    const existingScripts = this.document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    existingScripts.forEach((script) => script.remove());

    // Business structured data
    const businessData = {
      '@context': 'https://schema.org',
      '@type': 'HVACBusiness',
      name: 'Mitrik Hűtés',
      url: url,
      image: this.defaultImage,
      logo: 'https://mitrikhutes.hu/assets/logo.png',
      telephone: '+36-20-123-4567',
      inLanguage: lang,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Szeged',
        addressRegion: 'Csongrád-Csanád',
        addressCountry: 'HU',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '18:00',
        },
      ],
      priceRange: '$$',
      sameAs: ['https://www.facebook.com/valodi_oldal'],
      makesOffer: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: lang === 'hu' ? 'Klímaszerelés' : 'Air Conditioning Installation',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: lang === 'hu' ? 'Hőszivattyú telepítés' : 'Heat Pump Installation',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: lang === 'hu' ? 'Karbantartás' : 'Maintenance',
          },
        },
      ],
    };

    // FAQ structured data
    const faqData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: lang,
      mainEntity: [
        {
          '@type': 'Question',
          name:
            lang === 'hu'
              ? 'Mennyi idő egy klíma telepítése?'
              : 'How long does air conditioning installation take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              lang === 'hu'
                ? 'Általában 3–5 óra helyszíni adottságoktól függően.'
                : 'Usually 3–5 hours depending on on-site conditions.',
          },
        },
        {
          '@type': 'Question',
          name:
            lang === 'hu'
              ? 'Vállalnak karbantartást?'
              : 'Do you provide maintenance services?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              lang === 'hu'
                ? 'Igen, szezonális tisztítást és teljes ellenőrzést végzünk.'
                : 'Yes, we perform seasonal cleaning and full inspections.',
          },
        },
        {
          '@type': 'Question',
          name:
            lang === 'hu'
              ? 'Mely területeken dolgoznak?'
              : 'What areas do you serve?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              lang === 'hu'
                ? 'Szegeden és 50 km-es körzetében.'
                : 'In Szeged and within a 50 km radius.',
          },
        },
        {
          '@type': 'Question',
          name:
            lang === 'hu'
              ? 'Milyen típusú klímákat szereltek?'
              : 'What types of air conditioning systems do you install?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              lang === 'hu'
                ? 'Split, multi-split, parapet és mennyezeti kazettás rendszereket szerelünk lakossági és ipari ügyfeleknek.'
                : 'We install split, multi-split, parapet, and ceiling cassette systems for residential and commercial clients.',
          },
        },
        {
          '@type': 'Question',
          name:
            lang === 'hu'
              ? 'Mennyibe kerül egy hőszivattyú telepítése?'
              : 'How much does heat pump installation cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              lang === 'hu'
                ? 'Az ár a rendszer típusától és méretétől függ. Ingyenes felmérést készítünk, és részletes ajánlatot adunk.'
                : 'The price depends on the system type and size. We provide free assessments and detailed quotes.',
          },
        },
      ],
    };

    // Add structured data scripts
    this.addStructuredDataScript(businessData);
    this.addStructuredDataScript(faqData);

    // Add LocalBusiness schema for better local SEO
    const localBusinessData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': url,
      name: 'Mitrik Hűtés',
      image: this.defaultImage,
      telephone: '+36-20-123-4567',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Szeged',
        addressRegion: 'Csongrád-Csanád',
        postalCode: '6720',
        addressCountry: 'HU',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '46.2530',
        longitude: '20.1414',
      },
      url: url,
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '18:00',
        },
      ],
      areaServed: {
        '@type': 'City',
        name: 'Szeged',
      },
      serviceArea: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: '46.2530',
          longitude: '20.1414',
        },
        geoRadius: {
          '@type': 'Distance',
          value: '50',
          unitCode: 'KMT',
        },
      },
    };

    this.addStructuredDataScript(localBusinessData);
  }

  private addStructuredDataScript(data: object): void {
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  private getLocaleCode(lang: string): string {
    return lang === 'hu' ? 'hu_HU' : 'en_GB';
  }
}

