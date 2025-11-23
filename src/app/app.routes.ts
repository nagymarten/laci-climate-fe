import { Routes, CanActivateFn } from "@angular/router";
import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser, DOCUMENT } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { NotFoundComponent } from "./components/not-found/not-found.component";
import { CookieService } from "./services/cookie.service";

function setLangGuard(lang: "hu" | "en"): CanActivateFn {
  return (route) => {
    const t = inject(TranslateService);
    const doc = inject(DOCUMENT);
    const pid = inject(PLATFORM_ID);
    const cookieService = inject(CookieService);
    const router = inject(Router);

    // Priority: Cookie language first, then URL language
    if (isPlatformBrowser(pid)) {
      const cookieLang = cookieService.getCookieLanguage();
      if (
        cookieLang &&
        (cookieLang === "en" || cookieLang === "hu") &&
        cookieLang !== lang
      ) {
        // Cookie language takes priority - redirect to cookie language
        const currentPath = router.url.split("?")[0].split("#")[0];
        const segments = currentPath.split("/").filter(Boolean);
        const hasLang = segments[0] === "hu" || segments[0] === "en";
        const rest = hasLang ? segments.slice(1) : segments;

        router.navigate(["/", cookieLang, ...rest], {
          queryParamsHandling: "preserve",
          fragment: route.fragment ?? undefined,
          replaceUrl: true,
        });

        doc.documentElement.lang = cookieLang;
        t.setDefaultLang(cookieLang);
        t.use(cookieLang);
        return false; // Prevent current route activation
      }
    }

    // Use URL language
    doc.documentElement.lang = lang;
    t.setDefaultLang(lang);
    t.use(lang);

    // Only save URL language to cookie if no cookie preference exists
    // This prevents overwriting user's cookie preference when they visit a different language URL
    if (isPlatformBrowser(pid)) {
      const existingCookieLang = cookieService.getCookieLanguage();
      if (!existingCookieLang) {
        // No cookie preference exists, save URL language
        cookieService.setLanguage(lang);
      }
    }
    return true;
  };
}

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "hu" },

  {
    path: "hu",
    canActivate: [setLangGuard("hu")],
    children: [
      { path: "", component: HomeComponent },
      { path: "notfound", component: NotFoundComponent },
      { path: "**", redirectTo: "notfound" },
    ],
  },

  {
    path: "en",
    canActivate: [setLangGuard("en")],
    children: [
      { path: "", component: HomeComponent },
      { path: "notfound", component: NotFoundComponent },
      { path: "**", redirectTo: "notfound" },
    ],
  },

  { path: "**", component: NotFoundComponent },
];
