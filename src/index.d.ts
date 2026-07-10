/**
 * <dotrino-topbar> — barra superior estándar del ecosistema.
 *
 * Slots: `brand` (marca a medida), default (acciones al medio), `end`
 * (controles extra en el cluster derecho).
 * Parts: bar, back, brand, brand-icon, brand-name, mid, actions, lang,
 * lang-btn, profile, coin.
 * Vars de tema: --dotrino-topbar-{bg,border,text,muted,accent,pad,gap,font}.
 *
 * Perfil (§6.1): el topbar es DUEÑO del modal "Mi perfil". Pásale `identity` y
 * `reputation` (propiedades JS) y abre <dotrino-profile mode="self"> él mismo, así
 * la app no fija la versión de @dotrino/profile.
 */
export class DotrinoTopbar extends HTMLElement {
  /** Idioma activo ('es' | 'en'). */
  readonly lang: 'es' | 'en'
  /** Cambia el idioma, persiste y emite 'dotrino-lang'. */
  setLang(l: 'es' | 'en'): void
  /** Instancia de @dotrino/identity (Identity.connect()). Habilita el modal propio. */
  identity: any
  /** Instancia de @dotrino/reputation (createVaultReputation(id)). */
  reputation: any
  /** CSS vars --ccp-* para tematizar el modal de perfil (opcional). */
  profileTheme: Record<string, string> | null
  /** Abre el modal "Mi perfil". `editable` lo abre editable (onboarding). */
  openMyProfile(opts?: { editable?: boolean }): Promise<void>
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
