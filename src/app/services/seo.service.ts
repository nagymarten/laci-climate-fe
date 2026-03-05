import { inject, Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { DOCUMENT } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
// TODO: Uncomment when Google Business reviews are configured
// import { GoogleBusinessReviewsService } from "./google-business-reviews.service";

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
  providedIn: "root",
})
export class SEOService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);
  private translate = inject(TranslateService);
  // TODO: Uncomment when Google Business reviews are configured
  // private reviewService = inject(GoogleBusinessReviewsService);

  private readonly baseUrl = "https://mitrikhutes.hu";
  private readonly defaultImage = "https://mitrikhutes.hu/assets/images/climate-installation.jpg";

  updateSEO(data: SEOData): void {
    const lang = data.locale || "hu";
    const fullUrl = `${this.baseUrl}${data.url}`;

    // Update page title
    this.title.setTitle(data.title);

    // Update or create meta tags
    this.updateMetaTag("description", data.description);
    this.updateMetaTag("author", "Mitrik Hűtés");
    if (data.keywords) {
      this.updateMetaTag("keywords", data.keywords);
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
      type: data.type || "website",
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
    let canonical = this.document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;
    if (canonical) {
      canonical.href = url;
    } else {
      canonical = this.document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("href", url);
      this.document.head.appendChild(canonical);
    }
  }

  private updateHreflangTags(
    alternates: { lang: string; url: string }[]
  ): void {
    // Remove existing hreflang tags
    const existing = this.document.querySelectorAll(
      'link[rel="alternate"][hreflang]'
    );
    existing.forEach((tag) => tag.remove());

    // Add new hreflang tags
    alternates.forEach((alt) => {
      const link = this.document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", alt.lang);
      link.setAttribute("href", `${this.baseUrl}${alt.url}`);
      this.document.head.appendChild(link);
    });

    // Add x-default
    const defaultLink = this.document.createElement("link");
    defaultLink.setAttribute("rel", "alternate");
    defaultLink.setAttribute("hreflang", "x-default");
    defaultLink.setAttribute("href", `${this.baseUrl}/hu`);
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
      { property: "og:title", content: data.title },
      { property: "og:description", content: data.description },
      { property: "og:url", content: data.url },
      { property: "og:image", content: data.image },
      { property: "og:type", content: data.type },
      { property: "og:locale", content: data.locale },
      { property: "og:site_name", content: "Mitrik Hűtés" },
    ];

    ogTags.forEach((tag) => {
      if (this.meta.getTag(`property="${tag.property}"`)) {
        this.meta.updateTag(tag);
      } else {
        this.meta.addTag(tag);
      }
    });

    // Add alternate locales
    this.meta.updateTag({ property: "og:locale:alternate", content: "en_GB" });
  }

  private updateTwitterTags(data: {
    title: string;
    description: string;
    image: string;
  }): void {
    const twitterTags = [
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: data.title },
      { name: "twitter:description", content: data.description },
      { name: "twitter:image", content: data.image },
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
      "@context": "https://schema.org",
      "@type": "HVACBusiness",
      name: "Mitrik Hűtés",
      url: url,
      image: [
        this.defaultImage,
        "https://mitrikhutes.hu/assets/images/climate-installation.jpg",
        "https://mitrikhutes.hu/assets/images/maintenance.png",
      ],
      logo: "https://mitrikhutes.hu/assets/images/logo.svg",
      telephone: "+36 20 226 09 59",
      inLanguage: lang,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Szeged",
        addressRegion: "Csongrád-Csanád",
        addressCountry: "HU",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "18:00",
        },
      ],
      priceRange: "$$",
      // TODO: Add real social media URLs
      // sameAs: ["https://www.facebook.com/mitrikhutes"],
      makesOffer: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name:
              lang === "hu" ? "Klímaszerelés" : "Air Conditioning Installation",
            image:
              "https://mitrikhutes.hu/assets/images/climate-installation.jpg",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name:
              lang === "hu"
                ? "Hőszivattyú telepítés"
                : "Heat Pump Installation",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: lang === "hu" ? "Karbantartás" : "Maintenance",
            image: "https://mitrikhutes.hu/assets/images/maintenance.png",
          },
        },
      ],
    };

    // FAQ structured data
    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name:
            lang === "hu"
              ? "Mennyi idő egy szegedi klímaszerelés?"
              : "How long does an air conditioning installation take in Szeged?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              lang === "hu"
                ? "A komplett klíma telepítés általában egy napot vesz igénybe a helyszíni felméréstől a próbaüzemig, így gyorsan élvezheted a kényelmes, energiatakarékos hűtést."
                : "A complete air conditioning installation in Szeged usually takes one day from the on-site survey to the test run, so you can enjoy quiet and efficient cooling right away.",
          },
        },
        {
          "@type": "Question",
          name:
            lang === "hu"
              ? "Milyen karbantartást igényel egy klíma rendszer?"
              : "What maintenance does an air conditioning system need?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              lang === "hu"
                ? "Évente legalább egyszer javasolt szakemberrel átvizsgáltatni a klíma rendszert: tisztítani kell a hőcserélőket, ellenőrizni a hűtőközeget és kalibrálni az elektronikát a hibamentes működésért."
                : "Have your air conditioning system checked at least once a year: clean the heat exchangers, verify the refrigerant level, and calibrate the electronics to avoid faults and reduce energy use.",
          },
        },
        {
          "@type": "Question",
          name:
            lang === "hu"
              ? "Hogyan válasszak klímát egy szegedi panellakáshoz?"
              : "How do I choose an air conditioner for a Szeged apartment block?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              lang === "hu"
                ? "A szegedi panellakásoknál fontos a pontos teljesítmény, a halk beltéri egység és a kondenzvíz biztonságos elvezetése. Helyszíni felméréssel segítünk kiválasztani a legjobb megoldást."
                : "For Szeged panel apartments, accurate capacity, low indoor noise, and safe condensate drainage are essential. Our on-site survey helps you pick the ideal unit.",
          },
        },
        {
          "@type": "Question",
          name:
            lang === "hu"
              ? "Szükség van-e engedélyre a szegedi klímaszereléshez?"
              : "Do I need permits for AC installation in Szeged?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              lang === "hu"
                ? "Társasházban célszerű a közös képviselő jóváhagyása, családi ház esetén pedig a szomszédok előzetes tájékoztatása. A szegedi klímaszerelést végig engedéllyel rendelkező szakembereink intézik."
                : "In condominiums you should ask the building manager for approval, while in detached houses notifying neighbors is recommended. Licensed technicians handle the entire air conditioning installation.",
          },
        },
        {
          "@type": "Question",
          name:
            lang === "hu"
              ? "Mennyibe kerül egy szegedi klímaszerelés?"
              : "How much does an air conditioning installation cost in Szeged?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              lang === "hu"
                ? "A klíma telepítés ára függ a választott típus, a teljesítmény és a munkavégzés összetettségétől. Ingyenes helyszíni felmérés után pontos, egyedi ajánlatot készítünk, amely tartalmazza az anyagköltségeket és a munkadíjat."
                : "The price of an air conditioning installation in Szeged depends on the chosen type, capacity, and complexity of the work. After a free on-site survey, we provide a detailed, personalized quote that includes material costs and labor.",
          },
        },
        {
          "@type": "Question",
          name:
            lang === "hu"
              ? "Mennyire energiahatékony egy modern klíma rendszer?"
              : "How energy-efficient is a modern air conditioning system?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              lang === "hu"
                ? "A mai klíma rendszerek A+++ energiateljesítmény osztályúak, ami akár 40-50%-kal alacsonyabb energiafogyasztást jelent a régi rendszerekhez képest. A pontos megtérülési időt a helyszíni felmérés során számoljuk ki."
                : "Today's air conditioning systems are A+++ energy rated, which can mean 40-50% lower energy consumption compared to older systems. We calculate the exact payback period during the on-site survey.",
          },
        },
        {
          "@type": "Question",
          name:
            lang === "hu"
              ? "Használható a klíma télen fűtésre is?"
              : "Can I use my air conditioning for heating in winter?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              lang === "hu"
                ? "Igen, a legtöbb modern klíma hőszivattyú-technológiával működik, így télen is hatékonyan fűthet vele. A hőszivattyús rendszerek akár -15°C-ig is stabilan működnek, így egész évben használhatók."
                : "Yes, most modern air conditioning units use heat pump technology, so they can efficiently heat in winter as well. Heat pump systems operate stably down to -15°C, making them usable year-round.",
          },
        },
        {
          "@type": "Question",
          name:
            lang === "hu"
              ? "Mi a különbség a split és multi-split klíma között?"
              : "What's the difference between split and multi-split air conditioning?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              lang === "hu"
                ? "A split klíma egy beltéri és egy kültéri egységből áll, míg a multi-split rendszer egy kültéri egységhez több beltéri egység csatlakozik. A multi-split ideális több szoba hűtésére vagy fűtésére, és költséghatékonyabb megoldás."
                : "A split air conditioning system consists of one indoor and one outdoor unit, while a multi-split system connects multiple indoor units to one outdoor unit. Multi-split is ideal for cooling or heating multiple rooms and is a more cost-effective solution.",
          },
        },
        {
          "@type": "Question",
          name:
            lang === "hu"
              ? "Mit tegyek, ha a klíma rendszerem meghibásodik?"
              : "What should I do if my air conditioning system breaks down?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              lang === "hu"
                ? "Amennyiben a klíma rendszereddel probléma van, lépj velünk kapcsolatba telefonon vagy e-mailben. Gyors hibaelhárítást biztosítunk, és ha szükséges, azonnal kiérünk a helyszínre. A szerviz munkákat is mi végezzük."
                : "If you have a problem with your air conditioning system, contact us by phone or email. We provide quick troubleshooting and, if necessary, come to the site immediately. We also handle all service work.",
          },
        },
        {
          "@type": "Question",
          name:
            lang === "hu"
              ? "Ingyenes a helyszíni felmérés Szegeden?"
              : "Is the on-site survey free in Szeged?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              lang === "hu"
                ? "Igen, a helyszíni felmérés teljesen ingyenes Szegeden és környékén. A felmérés során megnézzük a helyiségeket, kiszámoljuk a szükséges teljesítményt, és egyedi ajánlatot készítünk a számodra optimális klíma rendszerre."
                : "Yes, the on-site survey is completely free in Szeged and the surrounding area. During the survey, we inspect the rooms, calculate the required capacity, and prepare a personalized quote for the optimal air conditioning system for you.",
          },
        },
      ],
    };

    // Add structured data scripts
    this.addStructuredDataScript(businessData);
    this.addStructuredDataScript(faqData);

    // Add LocalBusiness schema for better local SEO
    const localBusinessData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": url,
      name: "Mitrik Hűtés",
      image: [
        this.defaultImage,
        "https://mitrikhutes.hu/assets/images/climate-installation.jpg",
        "https://mitrikhutes.hu/assets/images/maintenance.png",
      ],
      telephone: "+36 20 226 09 59",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Szeged",
        addressRegion: "Csongrád-Csanád",
        postalCode: "6720",
        addressCountry: "HU",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "46.2530",
        longitude: "20.1414",
      },
      url: url,
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "18:00",
        },
      ],
      areaServed: {
        "@type": "City",
        name: "Szeged",
      },
      serviceArea: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: "46.2530",
          longitude: "20.1414",
        },
        geoRadius: {
          "@type": "Distance",
          value: "50",
          unitCode: "KMT",
        },
      },
    };

    this.addStructuredDataScript(localBusinessData);

    // Add Service schema for rich results
    this.addServiceSchema(lang);

    // Add BreadcrumbList schema
    this.addBreadcrumbSchema(url, lang);

    // TODO: Add Review/Rating schema from Google Business Profile
    // Instructions: See GOOGLE_REVIEWS_SETUP.md for complete setup guide
    // When ready:
    // 1. Uncomment GoogleBusinessReviewsService import at top
    // 2. Uncomment reviewService injection above
    // 3. Uncomment the code below:
    /*
    this.reviewService.getReviews().subscribe((reviews) => {
      if (reviews && reviews.length > 0) {
        this.addReviewSchema(reviews);
      }
    });
    */
  }

  private addServiceSchema(lang: string): void {
    const services = [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name:
          lang === "hu"
            ? "Klímaszerelés Szeged"
            : "Air Conditioning Installation Szeged",
        description:
          lang === "hu"
            ? "Szakszerű klímaszerelés és telepítés Szegeden. Gyors, megbízható szolgáltatás versenyképes árakon."
            : "Professional air conditioning installation in Szeged. Fast, reliable service at competitive prices.",
        provider: {
          "@type": "HVACBusiness",
          name: "Mitrik Hűtés",
          telephone: "+36 20 226 09 59",
        },
        areaServed: {
          "@type": "City",
          name: "Szeged",
          "@id": "https://www.wikidata.org/wiki/Q130212",
        },
        serviceType: "HVAC Installation",
        offers: {
          "@type": "Offer",
          priceCurrency: "HUF",
          price: "95000",
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "HUF",
            price: "95000",
            valueAddedTaxIncluded: "true",
          },
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name:
          lang === "hu"
            ? "Hőszivattyú telepítés Szeged"
            : "Heat Pump Installation Szeged",
        description:
          lang === "hu"
            ? "Energiatakarékos hőszivattyú rendszerek telepítése és karbantartása Szegeden."
            : "Energy-efficient heat pump system installation and maintenance in Szeged.",
        provider: {
          "@type": "HVACBusiness",
          name: "Mitrik Hűtés",
          telephone: "+36 20 226 09 59",
        },
        areaServed: {
          "@type": "City",
          name: "Szeged",
        },
        serviceType: "Heat Pump Installation",
      },
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: lang === "hu" ? "Klíma karbantartás" : "Air Conditioning Maintenance",
        description:
          lang === "hu"
            ? "Rendszeres klíma karbantartás és szerviz szolgáltatás a hosszú élettartam érdekében."
            : "Regular air conditioning maintenance and service for long-term performance.",
        provider: {
          "@type": "HVACBusiness",
          name: "Mitrik Hűtés",
          telephone: "+36 20 226 09 59",
        },
        areaServed: {
          "@type": "City",
          name: "Szeged",
        },
        serviceType: "HVAC Maintenance",
      },
    ];

    services.forEach((service) => this.addStructuredDataScript(service));
  }

  private addBreadcrumbSchema(url: string, lang: string): void {
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: lang === "hu" ? "Kezdőlap" : "Home",
          item: `https://mitrikhutes.hu/${lang}`,
        },
      ],
    };

    this.addStructuredDataScript(breadcrumb);
  }

  /**
   * TODO: Add review schema from Google Business Profile
   *
   * SETUP REQUIRED - See GOOGLE_REVIEWS_SETUP.md for complete instructions
   *
   * Quick steps:
   * 1. Get Google Place ID from https://developers.google.com/maps/documentation/place-id-finder
   * 2. Enable Places API in Google Cloud Console
   * 3. Create and configure API key
   * 4. Update src/environments/environment.ts with credentials
   * 5. Set enableGoogleReviews: true
   * 6. Uncomment GoogleBusinessReviewsService usage in updateStructuredData()
   *
   * This method generates Schema.org Review markup for search engines
   * using REAL customer reviews from Google Business Profile.
   *
   * @param reviews Array of review objects from Google Business Profile API
   */
  private addReviewSchema(reviews?: any[]): void {
    if (!reviews || reviews.length === 0) {
      // No reviews available - skip schema generation
      return;
    }

    // Calculate aggregate rating from real reviews
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(1);

    const reviewSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Mitrik Hűtés",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        bestRating: "5",
        worstRating: "1",
        ratingCount: reviews.length.toString(),
      },
      // Add individual reviews
      review: reviews.slice(0, 5).map((review) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: review.authorName || "Anonymous",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating.toString(),
          bestRating: "5",
          worstRating: "1",
        },
        reviewBody: review.text,
        datePublished: review.createTime,
      })),
    };

    this.addStructuredDataScript(reviewSchema);
  }

  private addStructuredDataScript(data: object): void {
    const script = this.document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  private getLocaleCode(lang: string): string {
    return lang === "hu" ? "hu_HU" : "en_GB";
  }
}
