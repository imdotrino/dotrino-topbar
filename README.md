# @dotrino/topbar

> **Parte del ecosistema [Dotrino](https://dotrino.com).** Sin anuncios, sin
> cookies, sin rastreo.

La **barra superior estándar** del ecosistema Dotrino, en **un solo Web
Component**. Deja de reimplementar (y de desviar) el header en cada app.

Empaqueta, en el orden y comportamiento normados (CONVENCIONES §5/§6/§9):

```
[◀ volver] [icono + nombre]   … acciones de la app …   [ES|EN] [perfil] [🪙 support]
```

con la **segunda fila de acciones en móvil**, `env(safe-area-inset-*)`, Shadow
DOM (sin JS de terceros ni cookies) y estética oscura tematizable. Reúne las tres
piezas compartidas para que la app importe **una sola cosa**:

- **[`@dotrino/nav`](https://www.npmjs.com/package/@dotrino/nav)** → chevron de
  volver + captura del botón físico Android / gesto iOS / atrás del navegador.
- **[`@dotrino/support`](https://www.npmjs.com/package/@dotrino/support)** →
  moneda de soporte/donación.
- Botón de **perfil** opcional (apps con identidad): emite `dotrino-profile`; la
  app abre su `<dotrino-profile>` y le pasa el avatar del perfil activo.

## Uso

Vanilla:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@dotrino/topbar@0.1/src/index.js"></script>

<dotrino-topbar brand="Mi App" icon="/icon.svg"
  support-repo="imdotrino/mi-app"
  support-discord="https://discord.gg/D648uq7cth"
  profile>
  <!-- (opcional) botones de acción de tu app -->
  <button>Nueva</button>
</dotrino-topbar>
```

Vue 3 / Vite (npm):

```js
import '@dotrino/topbar'
```
```html
<dotrino-topbar brand="Mi App" icon="/icon.svg" :avatar="avatar" profile
  @dotrino-profile="openMyProfile" @dotrino-lang="e => lang = e.detail.lang">
  <button @click="nueva">Nueva</button>
</dotrino-topbar>
```

## Atributos

| Atributo | Qué hace |
|---|---|
| `brand` | nombre de la marca |
| `icon` | URL del icono de marca |
| `brand-href` | destino al pulsar la marca (default `./`) |
| `lang` | `es` \| `en` \| `auto` (default `auto`); persiste y refleja `document.documentElement.lang` |
| `home` | fallback de "volver" (default `https://dotrino.com`) |
| `no-back` | oculta el chevron de volver |
| `no-lang` | oculta el toggle de idioma |
| `profile` | muestra el botón de perfil (§6.1) |
| `avatar` | data-URI del avatar del perfil activo (si falta: silueta) |
| `support-href` | URL de support (default `https://ko-fi.com/dotrino`) |
| `support-repo` | repo para el botón "reportar" del support |
| `support-discord` | invitación de Discord del support |
| `support-contact` | pasa `contact` a `<dotrino-support>` |
| `no-support` | oculta la moneda de support |

## Eventos (bubbles, composed)

- `dotrino-lang` → `{ lang }` al cambiar de idioma
- `dotrino-profile` → al pulsar el botón de perfil

## Slot

El slot por defecto son los **botones de acción de tu app** (van al medio, entre
la marca y las acciones estándar).

## Temas

Variables CSS en el host: `--dotrino-topbar-bg`, `--dotrino-topbar-border`,
`--dotrino-topbar-text`, `--dotrino-topbar-muted`, `--dotrino-topbar-accent`.

Licencia MIT.
