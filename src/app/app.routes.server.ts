import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'hu',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'en',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Server // 404 pages should use Server rendering, not prerendering
  }
];
