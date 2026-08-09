# MAREA DESIGN SYSTEM

Bienvenido al sistema de diseño oficial de Marea Dulce. Este documento sirve como la única fuente de verdad (Single Source of Truth) para diseñadores y desarrolladores, garantizando una interfaz cohesiva, accesible y escalable.

---

## 1. Design Tokens

Los tokens son las variables fundamentales de nuestro sistema visual. Se gestionan globalmente a través de las variables CSS de Tailwind v4 (`src/index.css`).

### 1.1 Colores Semánticos (Brand Palette)

**Nunca uses valores Hexadecimales en los componentes**. Usa siempre los tokens correspondientes de Tailwind:

| Token | Valor HEX | Uso / Clase de Tailwind |
| :--- | :--- | :--- |
| **Primary** | `#6C5CE7` | `bg-primary`, `text-primary`, `border-primary` |
| **Primary Dark** | `#4834D4` | Hover states, gradients (`to-primary-dark`) |
| **Secondary** | `#D6BBFB` | Elementos secundarios, bordes sutiles, detalles |
| **Secondary Light**| `#EDE9FF` | Backgrounds suaves para elementos seleccionados |
| **Surface** | `#FDFDFD` | Fondos de tarjetas, modales y overlays |
| **Background** | `#F4F3FF` | Fondo principal de la aplicación (`bg-bg`) |
| **Border** | `#E8E3FF` | Todos los bordes separadores de la UI |
| **Text** | `#2D3436` | Texto principal, encabezados (`text-text`) |
| **Muted** | `#636E72` | Subtítulos, labels, texto de ayuda (`text-muted`) |

### 1.2 Tipografía

| Tipo | Familia | Uso principal |
| :--- | :--- | :--- |
| **Heading** | `Poppins` | Títulos de página, KPIs (`font-poppins`) |
| **Body** | `Inter` | Textos de UI, párrafos, tablas (`font-inter`) |
| **Accent** | `Playfair Display` | Detalles estéticos, marca (`font-accent`) |

### 1.3 Radios (Bubbly / Friendly UI)

- **Default / Card**: `1.5rem` (`rounded-brand`)
- **Button / Input**: `0.75rem` / `1rem`
- **Pill**: `9999px` (`rounded-full`)

---

## 2. Componentes Base (UI Primitives)

Los siguientes componentes están construidos en `src/components/ui/` y deben ser instanciados en toda la aplicación en lugar de replicar su marcado HTML/Tailwind.

### 2.1 `<Button>`
El botón universal de Marea.
- **Variantes:** `primary` (gradiente), `ghost` (transparente con hover oscuro), `outline` (borde), `danger`.
- **Tamaños:** `sm`, `md`, `lg`.
- Soporta `isLoading`, `leftIcon`, `rightIcon` y `fullWidth`.

### 2.2 `<Card>`
Contenedor base para agrupar contenido.
- **Variantes:** `solid` (blanco sólido con sombra), `glass` (transparente con desenfoque / backdrop-blur).

### 2.3 `<Input>`, `<Select>`, `<Textarea>`
Componentes de formulario controlados.
- Siempre incluyen estructura de `label` e integran estilos de foco unificados (`ring-primary/20`).
- Soportan `error` (cambian a estado rojo con mensaje).

### 2.4 `<Badge>`
Identificador visual pequeño, ideal para status (Pendiente, Listo).
- **Variantes:** `primary`, `success`, `warning`, `danger`, `info`, `default`.
- **Forma:** `pill` (redondo por defecto) o rectangular con bordes redondeados.

### 2.5 `<Switch>`
Alternativa moderna a los checkboxes.
- Incluye animaciones fluidas y maneja soporte para un `label` y `description`.

### 2.6 `<Modal>`
Overlay accesible para diálogos y pantallas sobrepuestas.
- Previene el *scroll* en el `body`.
- Incluye cierre haciendo clic en el *backdrop* y botón `X`.
- Soporta múltiples anchos (`maxWidth="md" | "lg" | "2xl"`).

---

## 3. Reglas de Implementación

1. **Reutiliza siempre:** Si vas a crear un botón o tarjeta, usa `<Button>` o `<Card>`. NO escribas `<button className="...">` de cero.
2. **Sin Estilos Inline:** Nunca uses `style={{ color: '#HEX' }}`. Mapea la variable al sistema de tokens.
3. **Consistencia Visual:** Cualquier nuevo color debe ser debatido y añadido a `index.css` y `tailwind.css` primero, para no romper la fuente única de verdad.
4. **Accesibilidad (WCAG 2.2):** Los textos `muted` aseguran un ratio de contraste válido contra el fondo claro. No clarees los textos más allá de `#636E72` sin supervisión.
