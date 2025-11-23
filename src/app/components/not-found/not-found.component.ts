import { Component, OnInit, inject, PLATFORM_ID, signal } from "@angular/core";
import { CommonModule, DOCUMENT, isPlatformBrowser } from "@angular/common";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { Meta, Title } from "@angular/platform-browser";
import { CookieService } from "../../services/cookie.service";

type Lang = "hu" | "en";
const SUPPORTED: Lang[] = ["hu", "en"];

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TranslateModule],
  templateUrl: "./not-found.component.html",
  styleUrl: "./not-found.component.css",
})
export class NotFoundComponent implements OnInit {
  private translate = inject(TranslateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private doc = inject(DOCUMENT);
  private title = inject(Title);
  private meta = inject(Meta);
  private cookieService = inject(CookieService);

  lang: Lang = "hu";

  isDark = signal(false);

  ngOnInit(): void {
    this.initLanguageMemoryFirst();
    this.updateSEO();
  }

  private initLanguageMemoryFirst(): void {
    const path = this.router.url.split("#")[0].split("?")[0];
    const seg = path.split("/").filter(Boolean)[0]?.toLowerCase();
    let chosen: Lang | null = null;

    // Priority: 1. URL language, 2. Cookie (if no URL), 3. Browser language (if no cookie)
    if (seg && (seg === "en" || seg === "hu")) {
      // URL language takes highest priority
      chosen = seg as Lang;
    } else if (isPlatformBrowser(this.platformId)) {
      // 1. Check cookie/localStorage first
      const cookieLang = this.cookieService.getCookieLanguage();
      if (cookieLang && SUPPORTED.includes(cookieLang.toLowerCase() as Lang)) {
        chosen = cookieLang.toLowerCase() as Lang;
      } else {
        // 2. Check browser language
        const browserLang = this.cookieService.getBrowserLanguage();
        if (browserLang && SUPPORTED.includes(browserLang.toLowerCase() as Lang)) {
          chosen = browserLang.toLowerCase() as Lang;
        }
      }
    }

    if (!chosen) {
      chosen = "hu";
      if (isPlatformBrowser(this.platformId)) {
        // Save language to cookies (if consent given) or localStorage
        this.cookieService.setLanguage(chosen);
      }
    }

    this.lang = chosen;

    this.translate.setDefaultLang(this.lang);
    this.translate.use(this.lang);
    this.doc?.documentElement?.setAttribute("lang", this.lang);

    // Navigate to correct language if URL doesn't match
    if (seg !== this.lang) {
      this.router.navigate(["/", this.lang, "notfound"], {
        replaceUrl: true,
        queryParamsHandling: "preserve",
        fragment: this.route.snapshot.fragment ?? undefined,
      });
    }

    // Get theme: cookie first, then browser preference
    if (isPlatformBrowser(this.platformId)) {
      const darkMode = this.cookieService.getTheme();
      if (darkMode !== null) {
        this.isDark.set(darkMode);
        if (darkMode) {
          this.doc?.documentElement?.classList.add("my-app-dark");
        } else {
          this.doc?.documentElement?.classList.remove("my-app-dark");
        }
      }
    }
  }

  backHome(): void {
    this.router.navigate(["/", this.lang]);
  }

  private updateSEO(): void {
    const currentPath = this.router.url.split("?")[0].split("#")[0];

    this.translate.get(["NOT_FOUND.TITLE"]).subscribe((translations) => {
      this.title.setTitle(translations["NOT_FOUND.TITLE"]);

      // Set noindex for 404 pages
      this.meta.updateTag({ name: "robots", content: "noindex, nofollow" });
      this.meta.updateTag({ name: "googlebot", content: "noindex, nofollow" });

      // Update canonical to prevent indexing
      let canonical = this.doc.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement;
      if (canonical) {
        canonical.href = `https://mitrikhutes.hu${currentPath}`;
      }
    });
  }
}
