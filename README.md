# Laci Climate Frontend

A modern, bilingual (Hungarian/English) Angular application for **Mitrik Hűtés** – a climate control and heating solutions company based in Szeged, Hungary. The website showcases air conditioning installation, heat pump systems, and maintenance services.

## 🌐 Live Site

**Production URL**: [mitrikhutes.hu](https://mitrikhutes.hu)

## ✨ Features

- **🌍 Bilingual Support**: Full Hungarian and English language support with seamless language switching
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS and PrimeNG components
- **🌙 Dark Mode**: User preference-based dark/light theme with localStorage persistence
- **🍪 Cookie Consent**: GDPR-compliant cookie consent management with granular controls
- **📧 Contact Form**: Integrated EmailJS contact form with automatic email replies
- **🔍 SEO Optimized**: Server-side rendering (SSR), meta tags, structured data, and sitemap
- **⚡ Performance**: Optimized builds with code splitting and lazy loading
- **🎨 Modern UI**: Built with PrimeNG 19 and Tailwind CSS 4 for a polished user experience

## 🛠️ Tech Stack

### Core Framework

- **Angular** 19.2.0 (Standalone components)
- **TypeScript** 5.7.2
- **RxJS** 7.8.0

### UI Libraries

- **PrimeNG** 19.0.10 - Component library
- **Tailwind CSS** 4.1.4 - Utility-first CSS framework
- **Angular Material** 19.2.9 - Material Design components
- **PrimeIcons** 7.0.0 - Icon library

### Additional Libraries

- **@ngx-translate/core** 16.0.4 - Internationalization
- **@emailjs/browser** 4.4.1 - Email service integration
- **@angular/ssr** 19.2.7 - Server-side rendering support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher (22.x recommended)
- **npm** 9.x or higher
- **Angular CLI** 19.2.7 or higher

```bash
# Verify installations
node --version
npm --version
ng version
```

## 🚀 Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/nagymarten/Laci_Climate_Frontend.git
   cd Laci_Climate_Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables** (if needed)
   - Create `src/environments/environment.ts` and `environment.prod.ts` if you need custom configuration
   - EmailJS configuration is handled in the component code

### Development

Start the development server:

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any source files.

**Note**: The default route redirects to `/hu` (Hungarian). Access English version at `/en`.

### Code Scaffolding

Generate new components, services, or other Angular artifacts:

```bash
# Generate a component
ng generate component component-name

# Generate a service
ng generate service service-name

# See all available schematics
ng generate --help
```

## 🏗️ Building

### Development Build

```bash
ng build
# or
npm run build
```

### Production Build

```bash
ng build --configuration production
# or
npm run build -- --configuration production
```

The build artifacts will be stored in the `dist/laci-climate-frontend/browser/` directory.

### Prerendering (Static Site Generation)

For static site generation with prerendering:

```bash
npm run prerender
# or for production
npm run prerender:prod
```

This generates static HTML files for all routes defined in `angular.json`:

- `/`
- `/hu`
- `/en`
- `/notfound`
- `/en/notfound`
- `/hu/notfound`

## 🧪 Testing

Run unit tests via [Karma](https://karma-runner.github.io):

```bash
ng test
# or
npm test
```

## 📦 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── cookie-consent/     # GDPR cookie consent component
│   │   ├── footer/             # Footer component
│   │   ├── home/               # Main home page component
│   │   └── not-found/          # 404 page component
│   ├── services/
│   │   ├── cookie.service.ts   # Cookie management service
│   │   └── seo.service.ts      # SEO meta tags and structured data
│   ├── app.component.ts        # Root component
│   ├── app.config.ts           # Application configuration
│   └── app.routes.ts           # Route definitions with language guards
├── assets/
│   ├── i18n/                   # Translation files
│   │   ├── en.json            # English translations
│   │   └── hu.json            # Hungarian translations
│   └── images/                 # Image assets
├── index.html                  # Main HTML template
├── main.ts                     # Application entry point
├── main.server.ts              # SSR entry point
└── styles.css                  # Global styles
```

## 🌍 Internationalization

The application uses `@ngx-translate/core` for internationalization. Translation files are located in `src/assets/i18n/`:

- `hu.json` - Hungarian translations
- `en.json` - English translations

Language switching is handled via route guards that set the language based on the URL path (`/hu` or `/en`).

## 🚢 Deployment

### GitHub Pages (Automated)

The project uses GitHub Actions for automated deployment. When code is pushed to the `master` branch, the workflow:

1. Builds the Angular app in production mode
2. Generates static files
3. Deploys to the `gh-pages` branch
4. Configures custom domain (`mitrikhutes.hu`)

**Workflow file**: `.github/workflows/deploy.yml`

### Manual Deployment

If you need to deploy manually:

1. **Install angular-cli-ghpages** (if not already installed):

   ```bash
   npm install -g angular-cli-ghpages
   ```

2. **Build and deploy**:

   ```bash
   # Build for production
   ng build --configuration production --base-href "/"

   # Deploy to GitHub Pages
   ngh --dir=dist/laci-climate-frontend/browser
   ```

## 🔧 Configuration

### Base Href

The application uses `/` as the base href for GitHub Pages deployment. This is configured in:

- `angular.json` (build configuration)
- `.github/workflows/deploy.yml` (CI/CD)

### Custom Domain

The custom domain `mitrikhutes.hu` is configured via:

- `CNAME` file in `dist/laci-climate-frontend/browser/` (auto-generated during build)
- GitHub Pages repository settings

### EmailJS Configuration

EmailJS service IDs and template IDs are configured in `src/app/components/home/home.component.ts`. Update these if you need to change the email service configuration.

## 📝 Scripts

Available npm scripts:

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run build:ssr` - Build with SSR support
- `npm run prerender` - Generate prerendered static pages
- `npm run prerender:prod` - Generate prerendered pages (production)
- `npm run watch` - Build in watch mode
- `npm test` - Run unit tests

## 🔒 Privacy & Compliance

- **Cookie Consent**: GDPR-compliant cookie consent banner with granular controls
- **Google Analytics**: Only loaded after user consent (GA4: `G-X3LHYY28JP`)
- **Data Handling**: Contact form data is processed via EmailJS

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Overview](https://angular.dev/tools/cli)
- [PrimeNG Documentation](https://primeng.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [ngx-translate Documentation](https://github.com/ngx-translate/core)

## 🤝 Contributing

This is a private project. For issues or feature requests, please contact the repository maintainer.

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using Angular 19**
