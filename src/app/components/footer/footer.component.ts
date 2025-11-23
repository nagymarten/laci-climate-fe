import { Component } from "@angular/core";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { TranslateModule } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-footer",
  imports: [CardModule, ButtonModule, TranslateModule, CommonModule],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.css",
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  githubUrl = "https://github.com/nagymarten";
}
