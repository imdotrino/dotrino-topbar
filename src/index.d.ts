/**
 * <dotrino-topbar> — barra superior estándar del ecosistema.
 *
 * Slots: `brand` (marca a medida), default (acciones al medio), `end`
 * (controles extra en el cluster derecho).
 * Parts: bar, back, brand, brand-icon, brand-name, mid, actions, lang,
 * lang-btn, profile, coin.
 * Vars de tema: --dotrino-topbar-{bg,border,text,muted,accent,pad,gap,font}.
 *
 * Perfil (§6.1): el botón despliega el MENÚ de perfiles —los de este aparato, «Abrir mi
 * perfil», «Crear perfil», «Adoptar un perfil» y «Iniciar sesión»/«Salir»—, y esas
 * opciones NAVEGAN a `profile.dotrino.com` (o a donde digan los atributos
 * `profile-*-href`). El topbar NO abre ningún modal: el de tu propio perfil se quitó
 * porque duplicaba esa página. Pásale `identity` y `reputation` (propiedades JS) para que
 * pueda listar los perfiles, pintar el avatar del activo y ofrecer «Salir».
 */
export class DotrinoTopbar extends HTMLElement {
  /** Idioma activo ('es' | 'en'). */
  readonly lang: 'es' | 'en'
  /** Cambia el idioma, persiste y emite 'dotrino-lang'. */
  setLang(l: 'es' | 'en'): void
  /** Instancia de @dotrino/identity (Identity.connect()). Habilita el menú de perfiles. */
  identity: any
  /** Instancia de @dotrino/reputation (createVaultReputation(id)). */
  reputation: any
  /** CSS vars --ccp-* para tematizar la tarjeta de perfil (opcional). */
  profileTheme: Record<string, string> | null
}

declare global {
  interface HTMLElementTagNameMap {
    'dotrino-topbar': DotrinoTopbar
  }
  interface HTMLElementEventMap {
    'dotrino-lang': CustomEvent<{ lang: 'es' | 'en' }>
    'dotrino-profile': CustomEvent<void>
    'dotrino-profile-name': CustomEvent<{ pubkey: string; name: string }>
    'dotrino-profile-close': CustomEvent<void>
  }
}
