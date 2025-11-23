import { Component, OnInit, OnDestroy, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { CheckboxModule } from "primeng/checkbox";
import { MatIconModule } from "@angular/material/icon";
import {
  CookieService,
  CookiePreferences,
} from "../../services/cookie.service";
import { PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "app-cookie-consent",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    MatIconModule,
  ],
  templateUrl: "./cookie-consent.component.html",
  styleUrl: "./cookie-consent.component.css",
})
export class CookieConsentComponent implements OnInit, OnDestroy {
  private cookieService = inject(CookieService);
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  showBanner = signal(false);
  showSettings = signal(false);

  preferences: CookiePreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check if user has already given consent
      if (!this.cookieService.hasConsent()) {
        // Disable body scroll
        document.body.style.overflow = "hidden";
        // Show banner after a short delay
        setTimeout(() => {
          this.showBanner.set(true);
        }, 1000);
      } else {
        // Load preferences and apply them
        this.preferences = this.cookieService.getPreferences();
        this.cookieService.saveConsent(this.preferences);
      }
    }
  }

  acceptAll(): void {
    this.preferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    this.saveAndClose();
  }

  acceptNecessary(): void {
    this.preferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    this.saveAndClose();
  }

  savePreferences(): void {
    // Necessary cookies are always enabled
    this.preferences.necessary = true;
    this.saveAndClose();
  }

  private saveAndClose(): void {
    this.cookieService.saveConsent(this.preferences);
    this.showBanner.set(false);
    this.showSettings.set(false);
    // Re-enable body scroll
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = "";

      // If no theme cookie is set, set it from browser preference
      const existingTheme = this.cookieService.getCookieTheme();
      if (existingTheme === null) {
        const browserTheme = this.cookieService.getBrowserTheme();
        this.cookieService.setTheme(browserTheme);

        // Apply the theme to the document
        if (browserTheme) {
          document.documentElement.classList.add("my-app-dark");
        } else {
          document.documentElement.classList.remove("my-app-dark");
        }
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("cookieConsentChanged"));
    }
  }

  openSettings(): void {
    // Load current preferences if consent exists, otherwise use defaults
    if (this.cookieService.hasConsent()) {
      this.preferences = this.cookieService.getPreferences();
    } else {
      // Reset to default preferences if no consent
      this.preferences = {
        necessary: true,
        analytics: false,
        marketing: false,
      };
    }
    this.showSettings.set(true);
  }

  closeSettings(): void {
    this.showSettings.set(false);
  }

  // Prevent unchecking necessary cookies
  onNecessaryChange(event: { checked: boolean }): void {
    if (!event.checked) {
      this.preferences.necessary = true;
    }
  }

  ngOnDestroy(): void {
    // Re-enable body scroll when component is destroyed
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = "";
    }
  }
}
