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
- Botón de **perfil** (atributo `profile`), en **toda** página: también la portada de un
  servicio o de una extensión. Abre un menú con los enlaces a `profile.dotrino.com`
  (abrir, crear, adoptar, iniciar sesión). Si la página le pasa `.identity`, el menú
  lista además los perfiles del dispositivo para cambiar, y el botón muestra el avatar
  del activo. Antes de abrirse emite `dotrino-profile` (cancelable).

## Uso

Vanilla:

```html
<!-- OJO: por CDN va SIEMPRE con `+esm`, no con `/src/index.js`. Este paquete
     importa @dotrino/nav, /support, /profile y /identity por su nombre, y un
     especificador desnudo NO resuelve en el navegador ("Failed to resolve module
     specifier"). `+esm` los reescribe a URLs del CDN. Por npm no aplica: el
     bundler los resuelve solo. -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@dotrino/topbar@0.9/+esm"></script>

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
| `profile` | muestra el botón de perfil (§6.1). Funciona sin `.identity`: el menú sale con los enlaces y sin la lista de perfiles |
| `profile-href` | a dónde lleva «Abrir mi perfil» (default `https://profile.dotrino.com/`) |
| `profile-new-href` | ídem para «Crear perfil» |
| `profile-adopt-href` | ídem para «Adoptar un perfil» |
| `profile-login-href` | ídem para «Iniciar sesión» (entrar con usuario y contraseña en un equipo prestado; default `https://profile.dotrino.com/login`) |
| `profile-target` | `_blank` para que esas cuatro abran en otra pestaña (popup de extensión) |
| `avatar` | data-URI del avatar del perfil activo (si falta: silueta) |
| `support-href` | URL de support (default `https://ko-fi.com/dotrino`) |
| `support-repo` | repo para el botón "reportar" del support |
| `support-discord` | invitación de Discord del support |
| `support-contact` | pasa `contact` a `<dotrino-support>` |
| `support-no-count` | pasa `no-count`: la moneda no registra la apertura en el store compartido. Para apps que **no hablan con ningún dominio de Dotrino** (las que corren en la máquina del usuario) |
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
