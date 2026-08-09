# Auditoría de Seguridad - MAREA DULCE

## 1. Row Level Security (RLS) Permisivo
- **Problema**: El archivo `supabase/schema.sql` define políticas temporales `USING (true)` para todas las tablas (`app_settings`, `customers`, `orders`, etc.) para cualquier usuario autenticado.
- **Impacto**: Cualquier usuario que se registre en la plataforma tiene permisos de lectura, escritura y eliminación total sobre la base de datos entera de MAREA DULCE. No existe aislamiento de datos (Data Isolation) entre cuentas o roles.
- **Severidad**: 🔴 CRÍTICA
- **Evidencia**: Líneas 178-187 en `supabase/schema.sql`.
- **Solución**: 
  - Crear una tabla de mapeo de usuarios (`user_roles`).
  - Reemplazar las políticas por reglas que validen `auth.uid() = user_id` o que verifiquen el rol del usuario (Ej: `auth.jwt() ->> 'role' = 'admin'`).
- **Riesgo de Implementación**: Alto. Modificar el RLS puede romper flujos existentes en el frontend si las consultas no se filtran correctamente por ID de usuario, o si el usuario actualmente activo no tiene los privilegios adecuados en la sesión.

## 2. Ausencia de Security Headers
- **Problema**: La aplicación servida no envía cabeceras de seguridad HTTP (CSP, HSTS, X-Frame-Options).
- **Impacto**: La aplicación es vulnerable a ataques de Clickjacking, XSS (al no haber CSP restrictivo) y MIME-Sniffing.
- **Severidad**: 🟠 MEDIA
- **Evidencia**: `vercel.json` no define el bloque `"headers"`.
- **Solución**: Configurar `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, y `X-Frame-Options` en el archivo de despliegue (`vercel.json`).
- **Riesgo de Implementación**: Bajo/Medio. Una política CSP demasiado estricta podría bloquear scripts legítimos de Supabase, Workers de imágenes o Google Fonts.

## 3. Manejo de Secretos en Frontend
- **Problema**: Supabase URL y Anon Key expuestos en el cliente (`VITE_SUPABASE_ANON_KEY`).
- **Impacto**: Por diseño, Supabase requiere estas llaves en el cliente. Sin embargo, combinadas con la vulnerabilidad Crítica #1 (RLS Permisivo), se convierte en un vector de ataque directo donde un atacante ni siquiera necesita el cliente de React para borrar la base de datos (solo un token JWT válido).
- **Severidad**: 🟡 INFORMATIVA (Pasa a Crítica por la Vulnerabilidad 1).
- **Evidencia**: `src/lib/supabase.ts`.
- **Solución**: Resolver el punto #1 (RLS estricto). No es posible ocultar el Anon Key en el cliente por arquitectura, pero su riesgo se mitiga al 100% con un RLS sólido.
- **Riesgo de Implementación**: Nulo.
