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
 *   El botón de perfil va en TODA app (§6.1: no existen las apps sin identidad):
 *   con `.identity` LLEVA a profile.dotrino.com y ofrece cambiar de perfil; si no,
 *   emite `dotrino-profile` y la app decide.
 *
 * Uso vanilla (por CDN va con `+esm`, NO con /src/index.js: los imports desnudos
 * de abajo no resuelven en el navegador; `+esm` los reescribe):
 *   <script type="module" src="https://cdn.jsdelivr.net/npm/@dotrino/topbar@0.5/+esm"></script>
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
 *   profile          muestra el botón de perfil (§6.1)
 *   profile-href     a dónde lleva «Abrir mi perfil» (por defecto profile.dotrino.com).
 *                    Para apps cuyo perfil NO vive ahí — p. ej. una extensión, con su
 *                    identidad en el service worker.
 *   profile-new-href   ídem para «Crear perfil»
 *   profile-adopt-href ídem para «Adoptar un perfil»
 *   profile-login-href ídem para «Iniciar sesión» (entrar con usuario y contraseña)
 *   profile-target   `_blank` para que esas tres abran en otra pestaña. Lo necesita quien
 *                    vive en una ventana de la que no se puede salir (el popup de una
 *                    extensión) o quien no quiere perder la pantalla en la que está.
 *   avatar           data-URI del avatar del perfil activo (si falta: silueta o,
 *                    si se pasó `identity`, el identicon derivado del perfil activo)
 *   support-href     URL de support (default https://ko-fi.com/dotrino)
 *   support-repo     repo para el botón "reportar" del support
 *   support-discord  invitación de Discord del support
 *   support-contact  si está, pasa `contact` a <dotrino-support>
 *   support-no-bubble  si está, la moneda no enseña sola su burbuja la primera vez
 *   support-no-count   si está, la moneda no cuenta la apertura en el store compartido
 *   support-share-url / support-share-text / support-app / support-x-handle
 *                    se propagan tal cual a la moneda, para las apps que enchufan
 *                    su propio enlace al compartir (p. ej. el de invitación de los
 *                    referidos, §12.3). La moneda vive en NUESTRO shadow DOM y la
 *                    recreamos en cada render: sin este passthrough la app no
 *                    tiene forma de llegar a ella.
 *   no-support       oculta la moneda de support
 *
 * Perfil (§6.1). Propiedades JS:
 *   .identity     instancia de @dotrino/identity (Identity.connect())
 *   .reputation   instancia de @dotrino/reputation (createVaultReputation(id))
 *   .profileTheme objeto de CSS vars --ccp-* para tematizar el modal (opcional)
 * El botón de perfil LLEVA a profile.dotrino.com (no abre modal: se quitó porque duplicaba
 * esa página) — o a donde diga `profile-href`. Al pasar el ratón —o al tocarlo en móvil— ofrece cambiar de perfil.
 * (antes: openMyProfile({ editable }) abría un modal editable para el onboarding
 * "ponte un apodo"). Si NO se setea identity, el botón solo emite 'dotrino-profile'
 * (clásico) y la app renderiza su propio <dotrino-profile>.
 *
 * Eventos (bubbles, composed):
 *   dotrino-lang          { lang }  al cambiar de idioma
 *   dotrino-profile       al pulsar el botón (cancelable: preventDefault para que
 *                         la app maneje el perfil en vez del modal propio del topbar)
 *   dotrino-profile-name  { pubkey, name }  al guardar el nombre en el modal
 *   dotrino-profile-close  al cerrar el modal
 *
 * PERSONALIZACIÓN por app (todo opcional, para que cada app tenga su variación):
 *   - **Slots con nombre**:
 *       <span slot="brand">…</span>  → reemplaza icono+nombre por tu marca a medida
 *                                       (logo inline, badges, lo que sea).
 *       (slot por defecto)           → tus botones de acción, al medio.
 *       <button slot="end">…</button>→ controles extra en el cluster derecho
 *                                       (p. ej. <dotrino-install>), antes de idioma.
 *       <button slot="trailing">…</button>→ al FINAL de todo (después de la moneda
 *                                       de support), p. ej. la hamburguesa de menú móvil.
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
// El topbar YA NO abre un modal de perfil (se quitó: duplicaba profile.dotrino.com). Una
// app que quiera mostrar la tarjeta de OTRA persona importa `@dotrino/profile` ella misma.
import { avatarDataUri } from '@dotrino/identity/avatar' // identicon del perfil activo (subpath barato: no arrastra core.js)

/** Tu perfil vive en una sola página del ecosistema; el topbar solo te lleva. */
const PROFILE_URL = 'https://profile.dotrino.com/'
/** Dónde se crea un perfil: una página común a todo el ecosistema (no un botón al vuelo). */
const CREATE_URL = 'https://profile.dotrino.com/create'
/**
 * ADOPTAR UN PERFIL: leer una invitación y traer aquí una cuenta que YA existe.
 *
 * Es la otra mitad de «crear perfil» —de dónde sale la cuenta que vas a usar— y va en
 * este menú porque es lo ÚNICO que está en todas las apps. La pantalla de emparejar de la
 * bóveda tiene sus propias condiciones: en un aparato que ya vive en una bóveda no se
 * ofrece, y entonces no quedaba NINGUNA forma de leer un QR. En un navegador todavía
 * puedes escribir la dirección; en la app de Dotrino no hay barra de direcciones.
 *
 * `/d` no tiene ninguna condición y atiende cualquier invitación —entrar en una bóveda,
 * entregarle esta cuenta o estrenar una—, porque el modo lo trae el propio QR.
 */
const ADOPT_URL = 'https://vault.dotrino.com/d'
/**
 * ENTRAR CON USUARIO Y CONTRASEÑA (`dotrino-passmanager/docs/temporary-access.md` §3.4).
 *
 * Es la puerta del equipo prestado: un aparato de tu cuenta cuya llave vive en tu bóveda y
 * se abre con una contraseña. Va en ESTE menú porque es el único sitio que está en todas
 * las apps — quien llega a un equipo que no es suyo abre la que sea y entra desde ahí.
 */
const LOGIN_URL = 'https://profile.dotrino.com/login'

/** Escape mínimo para el HTML que arma el menú. */
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const T = {
  es: {
    profile: 'Mi perfil', back: 'Volver', profiles: 'Tus perfiles', newProfile: 'Crear perfil',
    adoptProfile: 'Adoptar un perfil', openProfile: 'Abrir mi perfil', unnamedProfile: 'Perfil sin nombre',
    login: 'Iniciar sesión', logout: 'Salir', onlyHere: 'solo en esta pestaña'
  },
  en: {
    profile: 'My profile', back: 'Back', profiles: 'Your profiles', newProfile: 'Create profile',
    adoptProfile: 'Adopt a profile', openProfile: 'Open my profile', unnamedProfile: 'Unnamed profile',
    login: 'Sign in', logout: 'Sign out', onlyHere: 'this tab only'
  }
}

const PROFILE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" /></svg>`

class DotrinoTopbar extends HTMLElement {
  static get observedAttributes () { return ['brand', 'icon', 'brand-href', 'lang', 'avatar', 'profile', 'profile-href', 'profile-new-href', 'profile-adopt-href', 'profile-login-href', 'profile-target', 'support-share-url', 'support-share-text', 'support-app', 'support-x-handle'] }

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
    if (this._identity) this._refreshButtonAvatar()
  }

  disconnectedCallback () {
    this._cerrarMenu()
    if (this._fueraListener) { document.removeEventListener('click', this._fueraListener); this._fueraListener = null }
  }

  attributeChangedCallback (name, oldV, newV) {
    // `lang` hay que RE-RESOLVERLO: antes solo se leía en connectedCallback, así
    // que un cambio de atributo posterior al montaje re-renderizaba con el idioma
    // viejo (this._lang) y el atributo no servía de nada salvo en el mount.
    if (name === 'lang' && oldV !== newV) {
      const l = this._resolveLang()
      if (l !== this._lang) { this.setLang(l); return }   // setLang ya renderiza y avisa
    }
    if (this.shadowRoot.childElementCount) this.render()
  }

  /* ----- Perfil "Mi perfil": el topbar es DUEÑO del modal (§6.1) -----
   * La app le pasa su `identity` y `reputation` (los pilares que ya maneja) por
   * propiedad JS; el topbar crea el provider, deriva pubkey/nombre/avatar y abre
   * <dotrino-profile modal mode="self"> él mismo. Así la app NO fija la versión de
   * @dotrino/profile: viaja dentro de @dotrino/topbar. Si la app NO setea identity,
   * el botón solo emite `dotrino-profile` (comportamiento clásico) y la app decide. */
  get identity () { return this._identity || null }
  set identity (v) {
    v = v || null
    if (v === this._identity) return // evita re-render redundante (la app re-setea el mismo objeto)
    this._identity = v; this._provider = null
    if (this.shadowRoot) this._refreshButtonAvatar()
  }
  get reputation () { return this._reputation || null }
  set reputation (v) { v = v || null; if (v === this._reputation) return; this._reputation = v; this._provider = null }
  // Compat: algunas apps setean `profileTheme` para el modal, que ya no existe. Se acepta
  // y se ignora, para no romperlas por un atributo que ahora no pinta nada.
  get profileTheme () { return this._profileTheme || null }
  set profileTheme (v) { this._profileTheme = v || null }

  // Compat: algunas apps setean `profileTheme` para el modal, que ya no existe. Se acepta
  // y se ignora, para no romperlas por un atributo que ahora no pinta nada.
  get profileTheme () { return this._profileTheme || null }
  set profileTheme (v) { this._profileTheme = v || null }

  /**
   * Compat: alguna app (el home, para el onboarding «ponte un apodo») llama a esto para
   * abrir el perfil. El modal ya no existe, así que lleva a la página, que es donde de
   * verdad se edita. Se mantiene el nombre para no romperlas.
   */
  openMyProfile () { this._irAMiPerfil() }

  /**
   * DÓNDE VIVE EL PERFIL, por si no es `profile.dotrino.com`.
   *
   * El menú llevaba esas tres direcciones fijas, y hay apps donde el perfil NO está ahí: la
   * extensión del gestor de contraseñas lo tiene en una página suya, porque su identidad
   * vive en el service worker y no en el iframe del ecosistema. Mandarlas a
   * profile.dotrino.com las llevaría a otra identidad distinta de la que están usando.
   *
   * Sin los atributos, todo sigue apuntando a donde apuntaba.
   */
  get _profileHref () { return this.getAttribute('profile-href') || PROFILE_URL }
  get _profileNewHref () { return this.getAttribute('profile-new-href') || CREATE_URL }
  get _profileAdoptHref () { return this.getAttribute('profile-adopt-href') || ADOPT_URL }
  get _profileLoginHref () { return this.getAttribute('profile-login-href') || LOGIN_URL }
  /**
   * DÓNDE SE ABREN esas tres. Por defecto en la misma pestaña, como cualquier enlace.
   *
   * Con `profile-target="_blank"` se abren en una nueva, que es lo que necesita quien vive
   * en una ventana de la que no se puede salir — el popup de una extensión, donde navegar
   * mete el perfil dentro de una ventanita de 400px, o una pantalla de trabajo que no
   * quieres perder al mirar tu perfil.
   */
  get _profileTarget () {
    const t = this.getAttribute('profile-target')
    return t ? ` target="${esc(t)}" rel="noopener"` : ''
  }

  async _refreshButtonAvatar () {
    const id = this._identity
    if (!id) return
    // Respeta un avatar explícito que haya puesto la app; solo derivamos el nuestro.
    if (this.hasAttribute('avatar') && !this._avatarAuto) return
    try {
      let avatar = null
      try { const me = id.getMe ? await id.getMe() : null; if (me && me.avatar) avatar = me.avatar } catch (_) {}
      if (!avatar) {
        let pk = null
        try { const cur = id.currentProfile ? await id.currentProfile() : null; pk = cur && cur.pubkey } catch (_) {}
        if (!pk) pk = id.me && id.me.publickey
        if (pk) avatar = avatarDataUri(pk, { size: 72 })
      }
      // Solo si cambió: setAttribute dispara attributeChangedCallback → render
      // aunque el valor sea igual; el guard evita re-renders redundantes (y el
      // parpadeo del botón que desmonta el modal a medio abrir).
      if (avatar && this.getAttribute('avatar') !== avatar) { this._avatarAuto = true; this.setAttribute('avatar', avatar) }
    } catch (_) { /* deja el ícono genérico */ }
  }

  /**
   * CAMBIO RÁPIDO de perfil al pasar el ratón por el botón. Se carga la lista la primera
   * vez que hace falta (no en cada render) y se cierra al salir, al pulsar Escape o al
   * tocar fuera. Con teclado se abre al enfocar el botón, para que no sea solo de ratón.
   */
  _wireProfileMenu () {
    const wrap = this.shadowRoot.querySelector('.profile-wrap')
    const menu = this.shadowRoot.querySelector('.prof-menu')
    const btn = this.shadowRoot.querySelector('.profile')
    if (!wrap || !menu || !btn) return

    // El menú se abre al PULSAR, no al pasar por encima: un menú que aparece solo porque
    // el ratón pasa cerca es incómodo, y además así el gesto es el mismo en el escritorio
    // y en el móvil, donde no existe el hover.
    if (!this._fueraListener) {
      this._fueraListener = (e) => { if (!this.contains(e.target)) this._cerrarMenu() }
      document.addEventListener('click', this._fueraListener)
    }
    wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') { this._cerrarMenu(); btn.focus() } })
  }

  async _abrirMenu () {
    if (!this._identity) return
    const menu = this.shadowRoot.querySelector('.prof-menu')
    const btn = this.shadowRoot.querySelector('.profile')
    if (!menu || !btn) return
    await this._loadProfilesMenu()
    if (!menu.innerHTML) return
    menu.hidden = false
    btn.setAttribute('aria-expanded', 'true')
  }

  _cerrarMenu () {
    const menu = this.shadowRoot?.querySelector('.prof-menu')
    const btn = this.shadowRoot?.querySelector('.profile')
    if (menu) menu.hidden = true
    if (btn) btn.setAttribute('aria-expanded', 'false')
  }

  /** Pinta la lista de perfiles del dispositivo (avatar + nombre + cuál está activo). */
  async _loadProfilesMenu () {
    const id = this._identity
    const menu = this.shadowRoot.querySelector('.prof-menu')
    if (!id || !menu || typeof id.listProfiles !== 'function') return
    const t = T[this._lang] || T.es
    try {
      const lista = await id.listProfiles()
      if (!Array.isArray(lista) || !lista.length) return
      const filas = lista.map((p) => {
        const img = p.avatar || avatarDataUri(p.pubkey || p.id || '', { size: 44 })
        const nombre = p.name || t.unnamedProfile
        // UNA CUENTA A LA QUE SE ENTRÓ CON CONTRASEÑA se dice, y si es de paso se dice
        // además que vive solo en esta pestaña: es lo que explica que no esté en las demás
        // y que al cerrar no quede nada.
        const nota = p.login ? `<small class="nota">${esc(p.login.address)}${p.login.volatile ? ' · ' + esc(t.onlyHere) : ''}</small>` : ''
        return p.current
          ? `<div class="item" aria-current="true"><img src="${esc(img)}" alt="" /><span>${esc(nombre)}${nota}</span><span class="marca" aria-hidden="true">✓</span></div>`
          : `<button class="item" type="button" data-switch="${esc(p.id)}"><img src="${esc(img)}" alt="" /><span>${esc(nombre)}${nota}</span></button>`
      }).join('')
      // SALIR solo aparece cuando hay de dónde salir: la cuenta activa se abrió con una
      // contraseña. Para las demás no existe — de una cuenta tuya no se «sale».
      //
      // Y si la app empaqueta un `@dotrino/identity` anterior a 0.96.1, su cliente no tiene
      // `logoutLogin`: el botón no haría NADA y el usuario se quedaría dentro sin saber por
      // qué. En ese caso se enseña igual, pero llevando a la página del perfil, que sí sabe
      // cerrarlo. Un botón que calla es peor que uno que te manda a otro sitio.
      const dentro = lista.find((p) => p.current && p.login)
      const puedeSalir = typeof id.logoutLogin === 'function'
      menu.innerHTML = `<div class="head">${esc(t.profiles)}</div>${filas}<div class="sep"></div>` +
        `<a class="item"${this._profileTarget} href="${esc(this._profileHref)}">${esc(t.openProfile)}</a>` +
        `<a class="item"${this._profileTarget} href="${esc(this._profileNewHref)}${this._profileNewHref === CREATE_URL ? '?return=' + encodeURIComponent(location.href) : ''}">＋ ${esc(t.newProfile)}</a>` +
        `<a class="item"${this._profileTarget} href="${esc(this._profileAdoptHref)}${this._profileAdoptHref === ADOPT_URL ? '?return=' + encodeURIComponent(location.href) : ''}">↧ ${esc(t.adoptProfile)}</a>` +
        (dentro
          ? (puedeSalir
              ? `<button class="item" type="button" data-logout="1">⇥ ${esc(t.logout)}</button>`
              : `<a class="item"${this._profileTarget} href="${esc(this._profileHref)}">⇥ ${esc(t.logout)}</a>`)
          : `<a class="item"${this._profileTarget} href="${esc(this._profileLoginHref)}${this._profileLoginHref === LOGIN_URL ? '?return=' + encodeURIComponent(location.href) : ''}">⇤ ${esc(t.login)}</a>`)
      menu.querySelectorAll('[data-switch]').forEach((b) => b.addEventListener('click', async () => {
        b.disabled = true
        // Cambiar de perfil NO es reactivo por diseño: se recarga para que toda la app
        // arranque con el nuevo (las pestañas abiertas conservan el suyo).
        try { await id.switchProfile(b.getAttribute('data-switch')); location.reload() } catch (_) { b.disabled = false }
      }))
      const salir = menu.querySelector('[data-logout]')
      if (salir) {
        salir.addEventListener('click', async () => {
          salir.disabled = true
          // Salir borra la cuenta de este navegador: hay que recargar igual que al
          // cambiarse, porque la app entera está corriendo con ella.
          try { await id.logoutLogin(); location.reload() } catch (_) { salir.disabled = false }
        })
      }
    } catch (_) { /* sin perfiles que ofrecer: el botón sigue funcionando igual */ }
  }

  /**
   * Pulsar el avatar abre (o cierra) el menú: tus perfiles para cambiar, «Abrir mi perfil»
   * y «Crear perfil». Un solo gesto, el mismo en escritorio y en móvil.
   *
   * No abre ningún modal: el de TU perfil se quitó porque duplicaba
   * `profile.dotrino.com`. El modal sigue vivo para ver el perfil de OTRA persona, pero
   * eso lo monta cada app.
   */
  _onProfileClick (ev) {
    const evento = new CustomEvent('dotrino-profile', { bubbles: true, composed: true, cancelable: true })
    if (!this.dispatchEvent(evento)) return // la app lo maneja a su manera
    ev?.stopPropagation?.() // que no lo cierre el listener de «clic fuera»
    const menu = this.shadowRoot.querySelector('.prof-menu')
    if (menu && !menu.hidden) this._cerrarMenu()
    else this._abrirMenu()
  }

  _irAMiPerfil () {
    try { location.href = this._profileHref } catch (_) {}
  }

  _resolveLang () {
    const a = (this.getAttribute('lang') || 'auto').toLowerCase()
    if (a === 'es' || a === 'en') return a
    let saved = null
    try { saved = localStorage.getItem('dotrino.lang') } catch (_) {}
    if (saved === 'es' || saved === 'en') return saved
    return (navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es'
  }

  get lang () { return this._lang }

  /**
   * OJO: este setter no es opcional. `lang` es una propiedad NATIVA de
   * HTMLElement, así que el getter de arriba la sombrea; sin setter, asignar la
   * propiedad (`el.lang = 'es'`) NO reflejaba al atributo y se perdía EN
   * SILENCIO — sin error, ni siquiera en modo estricto. Y Vue, cuando el
   * elemento tiene la propiedad (`'lang' in el` → siempre, es nativa), prefiere
   * asignarla antes que el atributo: o sea que `:lang="lang"` era un no-op y el
   * topbar se quedaba con el idioma del NAVEGADOR. Síntoma: una app en español
   * abierta en un navegador en inglés servía `<html lang="en">` y el header en
   * inglés, rompiendo la coherencia lang/og:locale que pide §7.
   */
  set lang (v) {
    const l = String(v || '').toLowerCase()
    if (l !== 'es' && l !== 'en' && l !== 'auto') return
    this.setAttribute('lang', l)   // → attributeChangedCallback re-resuelve el idioma
  }

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

    // `support-no-bubble` apaga la burbuja que la moneda enseña sola la primera vez. En
    // una página tiene sentido; en una ventana pequeña que se abre y se cierra veinte
    // veces al día —el popup de una extensión— tapa el contenido en cada apertura. La
    // moneda ya lo admite (`no-bubble`); lo que faltaba era poder decírselo desde aquí.
    //
    // `support-no-count` apaga el conteo de aperturas de la moneda, que se registra en
    // el store COMPARTIDO (store.dotrino.com, un iframe). Una app que no puede hablarle a
    // ningún dominio de Dotrino —el Inspector corre en tu máquina y esa es su promesa—
    // no tenía forma de evitarlo desde el topbar y le salía un iframe bloqueado en la
    // consola. El conteo es opt-out, no opt-in: las apps del ecosistema lo quieren.
    //
    // `support-*` se propaga TAL CUAL a la moneda. Incluye lo de compartir
    // (share-url/share-text/app/x-handle): la moneda vive en NUESTRO shadow DOM
    // y la recreamos en cada render, así que una app que quisiera enchufar su
    // enlace de invitación (los referidos de Critters/Diamonds, §12.3) no tenía
    // forma de llegar y terminaba metiendo un MutationObserver dentro de este
    // shadowRoot para re-aplicar el atributo. Eso es culpa nuestra, no de la app.
    const support = has('no-support') ? '' : `<dotrino-support
      class="coin" part="coin"
      href="${this._attr('support-href') || 'https://ko-fi.com/dotrino'}"
      ${this._attr('support-repo') ? `repo="${this._attr('support-repo')}"` : ''}
      ${this._attr('support-discord') ? `discord="${this._attr('support-discord')}"` : ''}
      ${this._attr('support-share-url') ? `share-url="${this._attr('support-share-url')}"` : ''}
      ${this._attr('support-share-text') ? `share-text="${this._attr('support-share-text')}"` : ''}
      ${this._attr('support-app') ? `app="${this._attr('support-app')}"` : ''}
      ${this._attr('support-x-handle') ? `x-handle="${this._attr('support-x-handle')}"` : ''}
      ${has('support-contact') ? 'contact' : ''}
      ${has('support-no-count') ? 'no-count' : ''}
      ${has('support-no-bubble') ? 'no-bubble' : ''}
      lang="${lang}"></dotrino-support>`

    // El botón va envuelto para poder colgarle el CAMBIO RÁPIDO de perfil: al pasar el
    // ratón (o al enfocarlo con el teclado) aparece la lista de perfiles de este
    // dispositivo. Un clic sigue abriendo tu perfil, como siempre.
    const profile = has('profile') ? `<div class="profile-wrap" part="profile-wrap">
      <button class="profile" part="profile" type="button"
        title="${t.profile}" aria-label="${t.profile}" data-testid="my-profile"
        aria-haspopup="true" aria-expanded="false">
        ${avatar ? `<img src="${avatar}" alt="" />` : PROFILE_SVG}</button>
      <div class="prof-menu" part="profile-menu" data-testid="profile-menu" hidden></div>
    </div>` : ''

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
        /* La marca y el volver se anclan ARRIBA: si las acciones envuelven a varias
           líneas (móvil angosto), la marca no debe flotar al centro vertical. */
        .back, .brand { align-self: flex-start; }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit; font-weight: 700; min-width: 0; min-height: 38px; }
        .brand img { width: 28px; height: 28px; border-radius: 8px; flex: 0 0 auto; }
        .brand span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mid { display: flex; align-items: center; gap: 8px; min-width: 0; }
        /* Las acciones se envuelven UNA A UNA (no todo el grupo de golpe): al
           faltar espacio, solo el/los iconos que no caben bajan a otra línea,
           empezando por el de MÁS A LA IZQUIERDA (el primero visual). Truco:
           el DOM va en orden inverso + flex-direction:row-reverse → el orden
           visual es el correcto (end … trailing), pero el que "sobra" y se
           envuelve es el ÚLTIMO del DOM = el primero visual (izquierda).
           flex:1 + min-width:0 obliga a que envuelvan los ITEMS (no el grupo). */
        .actions {
          display: flex; align-items: center; gap: 10px;
          /* flex-basis:0 (no auto): así el corte de línea NO envuelve la caja de
             acciones entera junto a la marca; se queda en la fila y son sus ITEMS
             los que envuelven uno a uno cuando falta ancho. */
          flex: 1 1 0; min-width: 0;
          flex-wrap: wrap; flex-direction: row-reverse; justify-content: flex-start;
          row-gap: 8px;
        }
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
        .profile-wrap { position: relative; display: inline-flex; }
        .prof-menu {
          position: absolute; top: calc(100% + 6px); right: 0; z-index: 60;
          min-width: 208px; max-width: 280px; padding: 6px;
          background: var(--dt-bg, #0f1725); border: 1px solid var(--dt-border, #1e2a3d);
          border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.35);
          display: flex; flex-direction: column; gap: 2px;
        }
        .prof-menu[hidden] { display: none; }
        .prof-menu .item {
          /* box-sizing es lo que arregla que el resaltado del ratón se saliera de la caja:
             con width:100% MÁS el relleno, cada fila medía 16px de más y pintaba su fondo
             por encima del borde del menú (y de paso empujaba el visto contra él). */
          display: flex; align-items: center; gap: 8px; width: 100%; box-sizing: border-box;
          padding: 7px 8px; border: 0; border-radius: 9px; cursor: pointer;
          background: transparent; color: var(--dt-text, #dbe7f7); font: inherit; font-size: 13px; text-align: left;
          text-decoration: none;
        }
        .prof-menu .item:hover, .prof-menu .item:focus-visible { background: var(--dt-bg-2, #17263c); }
        .prof-menu .item[aria-current="true"] { color: var(--dt-accent, #9cc4ff); font-weight: 600; }
        .prof-menu .item img { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; flex: 0 0 auto; }
        .prof-menu .item span { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .prof-menu .item .nota { display: block; font-size: 11px; font-weight: 400; color: var(--dt-muted, #8ea0b8); overflow: hidden; text-overflow: ellipsis; }
        /* El ✓ del perfil activo, con su propio hueco: antes iba pegado al borde. */
        .prof-menu .item .marca { flex: 0 0 auto; margin-left: 2px; opacity: .9; }
        .prof-menu .sep { height: 1px; margin: 4px 2px; background: var(--dt-border, #1e2a3d); }
        .prof-menu .head { padding: 4px 8px 2px; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--dt-muted, #8ea0b8); }
        .profile svg { width: 20px; height: 20px; }
        /* La barra hace flex-wrap: las acciones bajan a otra fila SOLO si no caben
           (overflow real), no siempre. Al envolver, margin-left:auto las mantiene
           a la derecha y la marca se queda arriba-izquierda. */

        /*
         * LA FILA MÓVIL, DE VERDAD (CONVENCIONES §5: «marca en su fila a la izquierda,
         * botones abajo a la derecha»).
         *
         * Envolver ITEM A ITEM —lo de arriba— se porta bien cuando falta poco, y muy mal
         * cuando falta mucho: en un teléfono de 400 px la caja de acciones se quedaba en
         * 77 px y sus tres controles caían uno por línea, cada uno en su propia fila
         * pegada al borde derecho. La barra medía 188 px de alto y el botón de perfil
         * aparecía solo, a media pantalla. Se veía roto porque lo estaba.
         *
         * Aquí manda una REJILLA de dos filas, que es lo que se quería desde el principio:
         * arriba volver + marca + TODAS las acciones en una fila a la derecha; abajo, las
         * acciones de la app (el slot del medio) a lo ancho. 188 px → 93 px.
         *
         * La columna de la marca es la única elástica (minmax(0, 1fr)), así que lo que
         * cede cuando falta ancho es el NOMBRE —con sus puntos suspensivos— y nunca un
         * botón, que es lo que no se puede partir.
         */
        @media (max-width: 600px) {
          .bar {
            display: grid; align-items: center;
            grid-template-columns: auto minmax(0, 1fr) auto;
            grid-template-areas: "back brand actions" "mid mid mid";
            column-gap: var(--dt-gap); row-gap: 8px;
          }
          /* En la rejilla ya no hace falta anclarlos arriba: cada uno tiene su celda. */
          .back { grid-area: back; align-self: center; }
          .brand { grid-area: brand; align-self: center; }
          .actions { grid-area: actions; justify-self: end; flex: 0 0 auto; }
          .mid { grid-area: mid; flex-wrap: wrap; row-gap: 6px; }
          /* Sin acciones de la app, la segunda fila no existe (si no, dejaba un hueco). */
          .mid:empty { display: none; }
        }
        /*
         * MUY ANGOSTO: LA MARCA SE QUEDA EN EL ICONO.
         *
         * A 360 px el nombre se recortaba a «Do…», que no identifica nada; el icono sí. Se
         * esconde SOLO cuando hay icono que lo sustituya — una app sin icono conserva su
         * nombre aunque se recorte, porque quedarse sin las dos cosas es peor. Y solo
         * afecta al nombre que pinta el componente: si la app trae su marca por el slot,
         * es su decisión y no se toca.
         */
        @media (max-width: 430px) {
          .brand.with-icon span { display: none; }
        }
      </style>
      <header class="bar" part="bar">
        ${back}
        <a class="brand${icon ? ' with-icon' : ''}" part="brand" href="${brandHref}">
          <slot name="brand">
            ${icon ? `<img part="brand-icon" src="${icon}" alt="" width="28" height="28" onerror="this.style.display='none'" />` : ''}
            ${brand ? `<span part="brand-name">${brand}</span>` : ''}
          </slot>
        </a>
        <div class="mid" part="mid"><slot></slot></div>
        <div class="actions" part="actions">
          <!-- DOM en orden INVERSO (row-reverse lo vuelve al orden visual:
               end … idioma … perfil … support … trailing). El último del DOM
               = el primero visual (izquierda) es el primero en envolverse. -->
          <slot name="trailing"></slot>
          ${support}
          ${profile}
          ${langToggle}
          <slot name="end"></slot>
        </div>
      </header>`

    this.shadowRoot.querySelectorAll('.lang button').forEach((b) =>
      b.addEventListener('click', () => this.setLang(b.dataset.lang)))
    this.shadowRoot.querySelector('.profile')?.addEventListener('click', (e) => this._onProfileClick(e))
    this._wireProfileMenu()
  }

  _attr (n) { return this.getAttribute(n) }
}

if (!customElements.get('dotrino-topbar')) customElements.define('dotrino-topbar', DotrinoTopbar)
export { DotrinoTopbar }
