import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { SelectModule } from "primeng/select";
import { FormsModule } from "@angular/forms";
import { AnimateOnScrollModule } from "primeng/animateonscroll";
import { AvatarModule } from "primeng/avatar";
import { ScrollTopModule } from "primeng/scrolltop";
import { OrganizationChartModule } from "primeng/organizationchart";
import { MessageService, TreeNode } from "primeng/api";
import { MatIconModule } from "@angular/material/icon";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import emailjs from "@emailjs/browser";
import { Toast } from "primeng/toast";
import { Router, ActivatedRoute } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { ImageModule } from 'primeng/image';
import { ImageCompareModule } from "primeng/imagecompare";
import { CardModule } from "primeng/card";
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
import { SEOService } from "../../services/seo.service";


@Component({
  selector: "app-home",
  imports: [
    ButtonModule,
    CommonModule,
    TranslateModule,
    SelectModule,
    FormsModule,
    AnimateOnScrollModule,
    AvatarModule,
    ScrollTopModule,
    OrganizationChartModule,
    MatIconModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    Toast,
    ImageModule,
    ImageCompareModule,
    CardModule,
    FooterComponent,
    HeaderComponent,
  ],
  providers: [MessageService],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent implements OnInit {
  private translate = inject(TranslateService);
  private messageService = inject(MessageService);
  private seoService = inject(SEOService);

  @ViewChild("contactFormRef") contactForm!: ElementRef;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  scrollOpacity = 1;
  isVisible = true;

  name = "";
  message = "";
  email = "";
  phone = "";
  data: TreeNode[] = [];
  showScrollHint = true;

  ngOnInit(): void {
    this.updateOrganizationChart();
    this.updateSEO();

    if (isPlatformBrowser(this.platformId)) {
      const container = document.querySelector(".scrollable");
      if (container) (container as HTMLElement).scrollTop = 0;
    }

    // Listen to language changes from header component
    this.translate.onLangChange.subscribe(() => {
      this.updateOrganizationChart();
      this.updateSEO();
    });
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    if (!isPlatformBrowser(this.platformId)) return;
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY < 50) {
      this.scrollOpacity = 1;
      this.showScrollHint = true;
    } else if (scrollY < 150) {
      this.scrollOpacity = 1 - (scrollY - 50) / 100;
    } else {
      this.scrollOpacity = 0;
      setTimeout(() => {
        if (this.scrollOpacity === 0) this.showScrollHint = false;
      }, 1200);
    }
  }


  private updateOrganizationChart(): void {
    this.translate
      .get([
        "ORGANIZATION.TITLE",
        "ORGANIZATION.SPLIT",
        "ORGANIZATION.PARAPET",
        "ORGANIZATION.CASSETTE",
      ])
      .subscribe((tr) => {
        this.data = [
          {
            label: tr["ORGANIZATION.TITLE"],
            expanded: true,
            children: [
              { label: tr["ORGANIZATION.SPLIT"], expanded: true },
              { label: tr["ORGANIZATION.PARAPET"], expanded: true },
              { label: tr["ORGANIZATION.CASSETTE"], expanded: true },
            ],
          },
        ];
      });
  }


  sendMessage() {
    const localizedTitles = {
      en: "Your request has been received",
      hu: "Megkaptuk az üzenetét",
    };

    const localizedReplies = {
      hu: `Kedves ${this.name}!\n\nKöszönjük, hogy felvette velünk a kapcsolatot! Megkaptuk az alábbi kérését: „${localizedTitles["hu"]}”. Igyekszünk azt 3 munkanapon belül feldolgozni.\n\nÜdvözlettel:\nMitrik László`,
      en: `Hi ${this.name},\n\nThank you for reaching out! We have received your request: "${localizedTitles["en"]}" and will process it within 3 business days.\n\nBest regards,\nMitrik László`,
    };

    const lang = (this.translate.currentLang || "hu") as "hu" | "en";

    const templateParams = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      message: this.message,
      title: localizedTitles[lang],
      auto_reply_message: localizedReplies[lang],
    };

    emailjs
      .send(
        "service_iv5svdv",
        "template_lgz5yv7",
        templateParams,
        "UiZnfR01s1uECBEHS"
      )
      .then(() => {
        emailjs
          .send(
            "service_iv5svdv",
            "template_msr2hhd",
            templateParams,
            "UiZnfR01s1uECBEHS"
          )
          .then(() => {
            this.messageService.add({
              severity: "success",
              summary: lang === "hu" ? "Sikeres küldés" : "Message Sent",
              detail: lang === "hu" ? "Üzenet elküldve!" : "Message sent!",
              life: 4000,
            });
          })
          .catch((err) => {
            console.warn("Auto-reply failed:", err);
          });
      })
      .catch((error) => {
        this.messageService.add({
          severity: "error",
          summary: lang === "hu" ? "Hiba" : "Error",
          detail:
            (lang === "hu"
              ? "Hiba történt az üzenet küldésekor: "
              : "Failed to send email: ") + JSON.stringify(error),
          life: 5000,
        });
      });
  }

  callPhone() {
    window.location.href = "tel:+36201234567";
  }

  scrollToForm() {
    const offset = 100;

    const top =
      this.contactForm.nativeElement.getBoundingClientRect().top +
      window.scrollY -
      offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  }

  private updateSEO(): void {
    const currentLang = this.translate.currentLang || this.translate.defaultLang || "hu";
    const currentPath = this.router.url.split("?")[0].split("#")[0];
    
    this.translate.get(["SEO.TITLE", "SEO.DESCRIPTION", "SEO.KEYWORDS"]).subscribe((translations) => {
      this.seoService.updateSEO({
        title: translations["SEO.TITLE"],
        description: translations["SEO.DESCRIPTION"],
        keywords: translations["SEO.KEYWORDS"],
        url: currentPath,
        locale: currentLang,
        alternateLocales: [
          { lang: "hu", url: "/hu" },
          { lang: "en", url: "/en" },
        ],
      });
    });
  }
}
