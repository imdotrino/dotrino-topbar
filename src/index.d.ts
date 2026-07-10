/**
 * <dotrino-topbar> — barra superior estándar del ecosistema.
 *
 * Slots: `brand` (marca a medida), default (acciones al medio), `end`
 * (controles extra en el cluster derecho).
 * Parts: bar, back, brand, brand-icon, brand-name, mid, actions, lang,
 * lang-btn, profile, coin.
 * Vars de tema: --dotrino-topbar-{bg,border,text,muted,accent,pad,gap,font}.
 */
export class DotrinoTopbar extends HTMLElement {
  /** Idioma activo ('es' | 'en'). */
  readonly lang: 'es' | 'en'
  /** Cambia el idioma, persiste y emite 'dotrino-lang'. */
  setLang(l: 'es' | 'en'): void
}

declare global {
  interface HTMLElementTagNameMap {
    'dotrino-topbar': DotrinoTopbar
  }
  interface HTMLElementEventMap {
    'dotrino-lang': CustomEvent<{ lang: 'es' | 'en' }>
    'dotrino-profile': CustomEvent<void>
  }
}
