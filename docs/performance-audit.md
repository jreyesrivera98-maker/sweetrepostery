# Auditoría de Rendimiento (Performance) - MAREA DULCE

## 1. Bundle Size & Chunk Splitting (JavaScript)
- **Problema**: El chunk principal (`index-*.js`) tiene un peso superior a 480 KB (140 KB gzip). Esto provoca un bloqueo del subproceso principal en móviles gama media, afectando el TBT (Total Blocking Time) y el INP (Interaction to Next Paint).
- **Impacto**: Aumento del tiempo de carga inicial y posible penalización en Lighthouse.
- **Severidad**: 🟠 MEDIA
- **Evidencia**: Logs de Vite Build (`index-*.js 488.82 kB │ gzip: 141.87 kB`).
- **Solución**: Configurar `manualChunks` en `vite.config.ts` para separar las dependencias de proveedores (`vendor`), como React, Zustand, Date-fns, y Radix UI, fuera del hilo de la aplicación principal.
- **Riesgo de Implementación**: Bajo.

## 2. Optimización de Imágenes (LCP)
- **Problema**: Las imágenes de las tarjetas de recetas (en `/recetas` y `/catalogo`) probablemente usen etiquetas `<img>` simples sin propiedades de rendimiento.
- **Impacto**: Descarga bloqueante de recursos, afectando gravemente el Largest Contentful Paint (LCP) si las imágenes no están dimensionadas y cargadas en diferido.
- **Severidad**: 🟠 MEDIA
- **Evidencia**: Revisión del código (las imágenes en el front-end no implementan nativamente `loading="lazy"` o compresión WebP en el origen).
- **Solución**: Añadir el atributo `loading="lazy"` y `decoding="async"` a imágenes fuera de la pantalla. Para el catálogo público, utilizar propiedades explícitas de `width` y `height` para reducir el CLS (Cumulative Layout Shift).
- **Riesgo de Implementación**: Bajo.

## 3. Fuentes (Web Fonts)
- **Problema**: Las fuentes de Google (`Poppins`, `Inter`, `Playfair Display`) se cargan sin la estrategia `font-display: swap` de forma explícita en el CSS base, o mediante preconexiones incompletas en el HTML.
- **Impacto**: Parpadeo de texto invisible (FOIT), penalizando fuertemente métricas de carga en conexiones móviles (3G/4G lento).
- **Severidad**: 🟡 INFORMATIVA
- **Evidencia**: `index.html` carga las fuentes pero no hay un `preload` para la fuente crítica (Poppins).
- **Solución**: Agregar `<link rel="preload">` para la variante más usada de Poppins y asegurar `&display=swap` en la URL de Google Fonts (que de hecho ya está presente, pero falta el preload del HTML crítico).
- **Riesgo de Implementación**: Muy Bajo.
