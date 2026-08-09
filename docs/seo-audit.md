# Auditoría SEO & Indexabilidad - MAREA DULCE

## 1. Falta de Open Graph & Twitter Cards
- **Problema**: El archivo `index.html` público carece de etiquetas meta sociales (`og:title`, `og:description`, `og:image`, `twitter:card`).
- **Impacto**: Si la empresa o un vendedor comparte el enlace del catálogo público de MAREA DULCE en WhatsApp, Facebook o Twitter, aparecerá un enlace genérico sin imagen ni contexto rico, reduciendo masivamente el Click-Through Rate (CTR).
- **Severidad**: 🔴 CRÍTICA (Para la adquisición y ventas de la pastelería).
- **Evidencia**: Inspección de la cabecera `<head>` en `index.html`.
- **Solución**: Agregar un set de Open Graph básico y Twitter Cards en `index.html`, o idealmente un sistema de inyección dinámica desde el router (React Helmet o modificaciones manuales del document.head) cuando se renderice el catálogo (`/catalogo`).
- **Riesgo de Implementación**: Muy Bajo.

## 2. Aislamiento de las Rutas Privadas (Robots.txt)
- **Problema**: Al tratarse de una Single Page Application (SPA), los rastreadores web (Googlebot) podrían intentar acceder a rutas del dashboard (ej. `/pedidos`, `/clientes`).
- **Impacto**: Aunque el Guard (`ProtectedRoute`) bloquearía la vista, Google podría indexar URLs huérfanas de error o login en su lugar, ensuciando la indexación del dominio. Además, no se definió explícitamente un `robots.txt` para controlar el rastreo.
- **Severidad**: 🟠 MEDIA
- **Evidencia**: Ausencia de los archivos `public/robots.txt` y directivas en los headers del backend.
- **Solución**: 
  - Crear un archivo `public/robots.txt` que permita explícitamente rastrear `/`, `/catalogo` y disuada (Disallow) `/pedidos`, `/clientes`, `/recetas`, etc.
  - Asegurar que la metaetiqueta `robots` se inyecte dinámicamente como `noindex, nofollow` dentro de los layouts protegidos.
- **Riesgo de Implementación**: Bajo.

## 3. Canonical URLs e Información Estructurada (JSON-LD)
- **Problema**: La página pública del catálogo no presenta etiquetas de marcado de Schema.org (`LocalBusiness`, `Product`).
- **Impacto**: Google no entenderá semánticamente que la página del Catálogo está ofreciendo "Productos de Repostería" ni su rango de precios (vital para el posicionamiento de un negocio SaaS de ventas o de los propios pasteleros).
- **Severidad**: 🟡 INFORMATIVA
- **Evidencia**: Falta de scripts de tipo `application/ld+json`.
- **Solución**: Implementar una inyección ligera de `JSON-LD` que describa el negocio en la página principal, o los productos del catálogo dinámicamente.
- **Riesgo de Implementación**: Medio (requiere configuración a nivel de Componente en React).
