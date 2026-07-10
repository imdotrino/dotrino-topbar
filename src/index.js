/**
 * @dotrino/topbar — la BARRA SUPERIOR estándar del ecosistema Dotrino, en UN
 * solo Web Component. Deja de reimplementar (y desviar) el header en cada app.
 *
 * Empaqueta, en el orden y comportamiento normados (CONVENCIONES §5/§6/§9):
 *   [◀ volver] [marca: icono + nombre]  … <slot acciones> …  [ES|EN] [perfil] [🪙 support]
 * con la **segunda fila de acciones en móvil**, `env(safe-area-inset-*)`, Shadow
 * DOM (sin JS de terceros ni cookies) y estética oscura por defecto tematizable.
 *
 * Reúne las tres piezas compartidas para que la app importe UNA sola cosa:
 *   - `@dotrino/nav`     → chevron de volver + captura del botón físico Android /
 *                          gesto iOS / atrás del navegador (`<dotrino-back>`).
 *   - `@dotrino/support` → moneda de soporte/donación (`<dotrino-support>`).
 *   El botón de perfil es opcional (apps con identidad, §6.1): la app escucha
 *   `dotrino-profile` y abre su `<dotrino-profile>`; el avatar se pasa por atributo.
 *
 * Uso vanilla:
 *   <script type="module" src=".../@dotrino/topbar/src/index.js"></script>
 *   <dotrino-topbar brand="Mi App" icon="/icon.svg"
 *     support-repo="imdotrino/mi-app" profile></dotrino-topbar>
 *
 * Uso Vue 3: `import '@dotrino/topbar'` y usar el tag; los eventos son nativos.
 *
 * Atributos:
 *   brand            nombre de la marca (texto a la derecha del icono)
 *   icon             URL del icono de marca (p. ej. /icon.svg)
 *   brand-href       destino al pulsar la marca (default "./")
 *   lang             'es' | 'en' | 'auto' (default 'auto'); persiste y refleja
 *   home             fallback de "volver" si no hay historial (default dotrino.com)
 *   no-back          oculta el chevron de volver
 *   no-lang          oculta el toggle de idioma (apps de un solo idioma)
 *   profile          muestra el botón de perfil (§6.1); emite 'dotrino-profile'
 *   avatar           data-URI del avatar del perfil activo (si falta: silueta)
 *   support-href     URL de support (default https://ko-fi.com/dotrino)
 *   support-repo     repo para el botón "reportar" del support
 *   support-discord  invitación de Discord del support
 *   support-contact  si está, pasa `contact` a <dotrino-support>
 *   no-support       oculta la moneda de support
 *
 * Eventos (bubbles, composed):
 *   dotrino-lang      { lang }  al cambiar de idioma
 *   dotrino-profile   al pulsar el botón de perfil
 *
 * PERSONALIZACIÓN por app (todo opcional, para que cada app tenga su variación):
 *   - **Slots con nombre**:
 *       <span slot="brand">…</span>  → reemplaza icono+nombre por tu marca a medida
 *                                       (logo inline, badges, lo que sea).
 *       (slot por defecto)           → tus botones de acción, al medio.
 *       <button slot="end">…</button>→ controles extra en el cluster derecho
 *                                       (p. ej. <dotrino-install>), antes de idioma.
 *   - **CSS `::part()`** para reestilar cualquier pieza desde el CSS de la app:
 *       dotrino-topbar::part(bar) { … }      part(brand) part(brand-name)
 *       part(actions) part(lang) part(lang-btn) part(profile) part(coin) part(back)
 *   - **Variables de tema** en el host (con default oscuro):
 *       --dotrino-topbar-bg / -border / -text / -muted / -accent / -pad / -gap / -font
 *   - Los elementos que pasás por slot viven en el light DOM → los estiliza tu
 *     propio CSS directamente (sin `::part`).
 */
import { createBackNav, getBackNav } from '@dotrino/nav' // registra <dotrino-back> + controlador
import '@dotrino/support'

const T = {
  es: { profile: 'Mi perfil', back: 'Volver' },
  en: { profile: 'My profile', back: 'Back' }
}

const PROFILE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" /></svg>`

class DotrinoTopbar extends HTMLElement {
  static get observedAttributes () { return ['brand', 'icon', 'brand-href', 'lang', 'avatar', 'profile'] }

  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this._lang = 'es'
  }

  connectedCallback () {
    this._lang = this._resolveLang()
    document.documentElement.lang = this._lang
    // Instala el controlador de "volver" (si la app no lo hizo ya). Sin esto,
    // <dotrino-back> cae a un heurístico débil (history.length) que NO lleva a
    // dotrino.com cuando no hay página anterior. El controlador decide por
    // referrer: sin página previa real → va a `home`.
    if (!this.hasAttribute('no-back') && !getBackNav()) {
      try { createBackNav({ home: this.getAttribute('home') || 'https://dotrino.com' }) } catch (_) {}
    }
    this.render()
  }

  attributeChangedCallback () { if (this.shadowRoot.childElementCount) this.render() }

  _resolveLang () {
    const a = (this.getAttribute('lang') || 'auto').toLowerCase()
    if (a === 'es' || a === 'en') return a
    let saved = null
    try { saved = localStorage.getItem('dotrino.lang') } catch (_) {}
    if (saved === 'es' || saved === 'en') return saved
    return (navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es'
  }

  get lang () { return this._lang }

  setLang (l) {
    if (l !== 'es' && l !== 'en') return
    this._lang = l
    try { localStorage.setItem('dotrino.lang', l) } catch (_) {}
    document.documentElement.lang = l
    // propagar a los sub-componentes que aceptan lang
    for (const sel of ['dotrino-support', 'dotrino-back']) {
      this.shadowRoot.querySelector(sel)?.setAttribute('lang', l)
    }
    this.render()
    this.dispatchEvent(new CustomEvent('dotrino-lang', { detail: { lang: l }, bubbles: true, composed: true }))
  }

  render () {
    const lang = this._lang
    const t = T[lang]
    const has = (a) => this.hasAttribute(a)
    const brand = this.getAttribute('brand') || ''
    const icon = this.getAttribute('icon') || ''
    const brandHref = this.getAttribute('brand-href') || './'
    const avatar = this.getAttribute('avatar') || ''
    const home = this.getAttribute('home') || 'https://dotrino.com'

    const support = has('no-support') ? '' : `<dotrino-support
      class="coin" part="coin"
      href="${this._attr('support-href') || 'https://ko-fi.com/dotrino'}"
      ${this._attr('support-repo') ? `repo="${this._attr('support-repo')}"` : ''}
      ${this._attr('support-discord') ? `discord="${this._attr('support-discord')}"` : ''}
      ${has('support-contact') ? 'contact' : ''}
      lang="${lang}"></dotrino-support>`

    const profile = has('profile') ? `<button class="profile" part="profile" type="button"
      title="${t.profile}" aria-label="${t.profile}" data-testid="my-profile">
      ${avatar ? `<img src="${avatar}" alt="" />` : PROFILE_SVG}</button>` : ''

    const back = has('no-back') ? '' : `<dotrino-back class="back" part="back" lang="${lang}" home="${home}"></dotrino-back>`

    const langToggle = has('no-lang') ? '' : `<div class="lang" part="lang" role="group" aria-label="es / en">
      <button type="button" part="lang-btn" class="${lang === 'es' ? 'on' : ''}" data-lang="es">ES</button>
      <button type="button" part="lang-btn" class="${lang === 'en' ? 'on' : ''}" data-lang="en">EN</button></div>`

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --dt-bg: var(--dotrino-topbar-bg, rgba(20, 16, 40, .82));
          --dt-line: var(--dotrino-topbar-border, #2a2350);
          --dt-text: var(--dotrino-topbar-text, #e7e3ff);
          --dt-muted: var(--dotrino-topbar-muted, #9a92c4);
          --dt-accent: var(--dotrino-topbar-accent, #7c3aed);
          --dt-pad: var(--dotrino-topbar-pad, 10px clamp(12px, 4vw, 20px));
          --dt-gap: var(--dotrino-topbar-gap, 12px);
          --dt-font: var(--dotrino-topbar-font, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
        }
        .bar {
          display: flex; align-items: center; gap: var(--dt-gap); flex-wrap: wrap;
          padding: var(--dt-pad);
          padding-top: calc(env(safe-area-inset-top) + 10px);
          padding-left: max(clamp(12px, 4vw, 20px), env(safe-area-inset-left));
          padding-right: max(clamp(12px, 4vw, 20px), env(safe-area-inset-right));
          background: var(--dt-bg); color: var(--dt-text);
          border-bottom: 1px solid var(--dt-line);
          backdrop-filter: blur(8px); box-sizing: border-box;
          font-family: var(--dt-font);
        }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit; font-weight: 700; min-width: 0; }
        .brand img { width: 28px; height: 28px; border-radius: 8px; flex: 0 0 auto; }
        .brand span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mid { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
        .back { --cc-back-color: var(--dt-text); }
        /* Toggle de idioma = UN control segmentado (una sola pieza con borde
           único), no dos botones sueltos. Ambas opciones visibles (§9), la
           activa rellena con el color de acento. */
        .lang { display: inline-flex; border: 1px solid var(--dt-line); border-radius: 999px; overflow: hidden; }
        .lang button {
          background: transparent; border: none; color: var(--dt-muted);
          padding: 5px 11px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700;
        }
        .lang button + button { border-left: 1px solid var(--dt-line); }
        .lang button:hover { color: var(--dt-text); }
        .lang button.on { background: var(--dt-accent); color: var(--dotrino-topbar-accent-text, #fff); }
        .profile {
          width: 36px; height: 36px; padding: 0; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; border: 1px solid var(--dt-line); color: var(--dt-muted);
          cursor: pointer; overflow: hidden;
        }
        .profile:hover { color: var(--dt-text); border-color: var(--dt-accent); }
        .profile img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .profile svg { width: 20px; height: 20px; }
        /* La barra hace flex-wrap: las acciones bajan a otra fila SOLO si no caben
           (overflow real), no siempre. Al envolver, margin-left:auto las mantiene
           a la derecha y la marca se queda arriba-izquierda. */
      </style>
      <header class="bar" part="bar">
        ${back}
        <a class="brand" part="brand" href="${brandHref}">
          <slot name="brand">
            ${icon ? `<img part="brand-icon" src="${icon}" alt="" width="28" height="28" onerror="this.style.display='none'" />` : ''}
            ${brand ? `<span part="brand-name">${brand}</span>` : ''}
          </slot>
        </a>
        <div class="mid" part="mid"><slot></slot></div>
        <div class="actions" part="actions">
          <slot name="end"></slot>
          ${langToggle}
          ${profile}
          ${support}
        </div>
      </header>`

    this.shadowRoot.querySelectorAll('.lang button').forEach((b) =>
      b.addEventListener('click', () => this.setLang(b.dataset.lang)))
    this.shadowRoot.querySelector('.profile')?.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('dotrino-profile', { bubbles: true, composed: true })))
  }

  _attr (n) { return this.getAttribute(n) }
}

if (!customElements.get('dotrino-topbar')) customElements.define('dotrino-topbar', DotrinoTopbar)
export { DotrinoTopbar }
