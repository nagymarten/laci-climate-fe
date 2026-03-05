import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { WebVitalsService } from './services/web-vitals.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, CookieConsentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private webVitalsService = inject(WebVitalsService);

  ngOnInit(): void {
    // Initialize Web Vitals tracking
    this.webVitalsService.initWebVitals();
  }
}
