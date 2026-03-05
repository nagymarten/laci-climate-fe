import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

declare const gtag: Function;

@Injectable({ providedIn: "root" })
export class WebVitalsService {
  private platformId = inject(PLATFORM_ID);

  initWebVitals(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    import("web-vitals").then(({ onCLS, onLCP, onINP, onFCP, onTTFB }) => {
      // Core Web Vitals
      onCLS(this.sendToAnalytics.bind(this));
      onLCP(this.sendToAnalytics.bind(this));

      // Additional metrics
      onINP(this.sendToAnalytics.bind(this));
      onFCP(this.sendToAnalytics.bind(this));
      onTTFB(this.sendToAnalytics.bind(this));
    }).catch((error) => {
      console.warn("Failed to load web-vitals:", error);
    });
  }

  private sendToAnalytics(metric: any): void {
    // Only send if Google Analytics is loaded
    if (typeof gtag !== "undefined") {
      gtag("event", metric.name, {
        event_category: "Web Vitals",
        value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }
}
