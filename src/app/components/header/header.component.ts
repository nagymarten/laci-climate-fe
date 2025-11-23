import {
  Component,
  OnInit,
  inject,
  signal,
  PLATFORM_ID,
  effect,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { SelectModule, Select } from "primeng/select";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { isPlatformBrowser, DOCUMENT } from "@angular/common";
import { CookieService } from "../../services/cookie.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    SelectModule,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css",
})
export class HeaderComponent implements OnInit {
  private translate = inject(TranslateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private doc = inject(DOCUMENT);
  private cookieService = inject(CookieService);

  isDark = signal(false);
  languages = [
    { name: "English", code: "en" },
    { name: "Magyar", code: "hu" },
  ];
  selectedLanguage: { name: string; code: string } | undefined;

  constructor() {
    // Watch for cookie consent changes
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const hasConsent = this.cookieService.hasConsent();
        // Disable scrolling if cookies are not set
        if (!hasConsent) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "";
        }
      });
    }
  }

  ngOnInit(): void {
    this.initLanguageSSRFirst();

    if (isPlatformBrowser(this.platformId)) {
      // Check initial cookie consent state and disable scrolling if cookies not set
      const hasConsent = this.cookieService.hasConsent();
      if (!hasConsent) {
        document.body.style.overflow = "hidden";
      }

      // Get theme: cookie first, then browser preference
      const darkMode = this.cookieService.getTheme();
      if (darkMode !== null) {
        this.isDark.set(darkMode);
        if (darkMode) {
          this.doc?.documentElement?.classList.add("my-app-dark");
        } else {
          this.doc?.documentElement?.classList.remove("my-app-dark");
        }
      }

      // Listen for browser theme changes
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
        // Only apply browser theme if no cookie preference is set
        const cookieTheme = this.cookieService.getCookieTheme();
        if (cookieTheme === null) {
          const isDark = e.matches;
          this.isDark.set(isDark);
          if (isDark) {
            this.doc?.documentElement?.classList.add("my-app-dark");
          } else {
            this.doc?.documentElement?.classList.remove("my-app-dark");
          }
        }
      };

      // Modern browsers
      if (darkModeQuery.addEventListener) {
        darkModeQuery.addEventListener("change", handleThemeChange);
      } else {
        // Fallback for older browsers
        darkModeQuery.addListener(handleThemeChange);
      }

      // Listen for storage changes (when cookie consent is given in another tab)
      window.addEventListener("storage", () => {
        const hasConsent = this.cookieService.hasConsent();
        if (!hasConsent) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "";
        }
      });

      // Listen for custom event when cookie consent is given in same tab
      window.addEventListener("cookieConsentChanged", () => {
        const hasConsent = this.cookieService.hasConsent();
        if (!hasConsent) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "";

          // If theme cookie was just set from browser preference, apply it
          const theme = this.cookieService.getTheme();
          if (theme !== null) {
            this.isDark.set(theme);
            if (theme) {
              this.doc?.documentElement?.classList.add("my-app-dark");
            } else {
              this.doc?.documentElement?.classList.remove("my-app-dark");
            }
          }
        }
      });
    }
  }

  private initLanguageSSRFirst(): void {
    const path = this.router.url.split("?")[0].split("#")[0];
    const seg = path.split("/").filter(Boolean)[0];
    let urlLang: "hu" | "en" = seg === "en" ? "en" : "hu";

    // Priority: 1. URL language, 2. Cookie (if no URL), 3. Browser language (if no cookie)
    if (!seg || (seg !== "en" && seg !== "hu")) {
      // If no language in URL, check cookie first, then browser language
      if (isPlatformBrowser(this.platformId)) {
        // 1. Check cookie/localStorage first
        const cookieLang = this.cookieService.getCookieLanguage();
        if (cookieLang && (cookieLang === "en" || cookieLang === "hu")) {
          urlLang = cookieLang as "hu" | "en";
        } else {
          // 2. Check browser language
          const browserLang = this.cookieService.getBrowserLanguage();
          if (browserLang && (browserLang === "en" || browserLang === "hu")) {
            urlLang = browserLang as "hu" | "en";
          }
        }
      }
    }
    // If URL has language, use it (highest priority)

    this.translate.setDefaultLang(urlLang);
    this.translate.use(urlLang);
    this.selectedLanguage = this.languages.find((l) => l.code === urlLang);

    if (isPlatformBrowser(this.platformId)) {
      // Only save URL language to cookie if no cookie preference exists
      // This prevents overwriting user's cookie preference
      const existingCookieLang = this.cookieService.getCookieLanguage();
      if (!existingCookieLang) {
        this.cookieService.setLanguage(urlLang);
      }
      this.doc.documentElement.lang = urlLang;
    }
  }

  toggleDark(): void {
    const newValue = !this.isDark();
    this.isDark.set(newValue);
    if (isPlatformBrowser(this.platformId)) {
      // Save theme to cookies (if consent given) or localStorage
      this.cookieService.setTheme(newValue);
      this.doc?.documentElement?.classList.toggle("my-app-dark", newValue);
    }
  }

  onLanguageChange(
    event: { value?: { name: string; code: string } | string },
    selectRef: Select
  ): void {
    const value = event?.value;
    const lang = ((typeof value === "object" && value !== null
      ? value.code
      : value) ?? "hu") as "hu" | "en";

    this.translate.use(lang);
    // Save language to cookies (if consent given) or localStorage
    this.cookieService.setLanguage(lang);

    const url = this.router.url.split("#")[0].split("?")[0];
    const segs = url.split("/").filter(Boolean);
    const hasLocale = segs[0] === "hu" || segs[0] === "en";
    const rest = hasLocale ? segs.slice(1) : segs;

    if (hasLocale && segs[0] === lang) return;

    this.router.navigate(["/", lang, ...rest], {
      queryParamsHandling: "preserve",
      fragment: this.route.snapshot.fragment ?? undefined,
    });

    if (selectRef?.el?.nativeElement) {
      selectRef.el.nativeElement.blur();
      selectRef.el.nativeElement.classList.remove("p-focus");
    }
  }

  getFlagUrl(code: string): string {
    if (code === "en") return "https://flagcdn.com/gb.svg";
    if (code === "hu") return "https://flagcdn.com/hu.svg";
    if (code === "de") return "https://flagcdn.com/de.svg";
    return "https://flagcdn.com/unknown.svg";
  }
}
