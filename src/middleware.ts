// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // 🔍 Esto saldrá en tu terminal cada vez que cargues una página
  console.log(`[MIDDLEWARE] Ruta interceptada: ${pathname}`);

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      console.log('[MIDDLEWARE] Acceso permitido a la página de login.');
      return next();
    }

    const token = context.cookies.get('token')?.value;
    console.log(`[MIDDLEWARE] Token evaluado:`, token ? 'Existe (válido)' : 'No existe (vacío)');

    if (!token) {
      console.log('[MIDDLEWARE] ⛔ Sin token. Redirigiendo al login...');
      return context.redirect('/admin/login');
    }
  }

  return next();
});