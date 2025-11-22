import { Component, OnInit, inject, PLATFORM_ID, signal } from "@angular/core";
import { CommonModule, DOCUMENT, isPlatformBrowser } from "@angular/common";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { Meta, Title } from "@angular/platform-browser";

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

  lang: Lang = "hu";

  isDark = signal(false);

  ngOnInit(): void {
    this.initLanguageMemoryFirst();
    this.updateSEO();
  }

  private initLanguageMemoryFirst(): void {
    let chosen: Lang | null = null;

    if (isPlatformBrowser(this.platformId)) {
      const saved = (localStorage.getItem("language") || "").toLowerCase();
      if (SUPPORTED.includes(saved as Lang)) {
        chosen = saved as Lang;
      }
      const darkMode = localStorage.getItem("isDarkMode");
      if (darkMode === "true") {
        this.isDark.set(true);
        this.doc?.documentElement?.classList.add("my-app-dark");
      }
    }

    if (!chosen) {
      chosen = "hu";
      if (isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem("language", chosen);
        } catch {}
      }
    }

    this.lang = chosen;

    this.translate.setDefaultLang(this.lang);
    this.translate.use(this.lang);
    this.doc?.documentElement?.setAttribute("lang", this.lang);

    const path = this.router.url.split("#")[0].split("?")[0];
    const seg = path.split("/").filter(Boolean)[0]?.toLowerCase();
    if (seg !== this.lang) {
      this.router.navigate(["/", this.lang, "notfound"], {
        replaceUrl: true,
        queryParamsHandling: "preserve",
        fragment: this.route.snapshot.fragment ?? undefined,
      });
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
