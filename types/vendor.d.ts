// Lo que el topbar usa de piezas que no publican tipos para estas rutas, y nada más.

declare module '@dotrino/identity/avatar' {
  /** El identicon de `seed` (una pubkey) como data-URI para `<img src>`. */
  export function avatarDataUri (seed: string, opts?: { size?: number }): string
}

declare module '@dotrino/identity/keyid' {
  /** El ID que se le enseña a una persona (`AB12-CD34`); '' si la llave no se puede leer. */
  export function keyLabel (publicJwkStr: string): Promise<string>
}

declare module '@dotrino/theme' {
  export type ThemeMode = 'auto' | 'light' | 'dark'
  /** Aplica `mode` ahora y lo recuerda. Lanza `theme-bad-mode` si no es uno de los tres. */
  export function setTheme (mode: ThemeMode): ThemeMode
  /** Al arrancar: aplica lo guardado. */
  export function applyTheme (): ThemeMode
  /** Lo que se está viendo, con `auto` resuelto contra el sistema. */
  export function resolvedTheme (): 'light' | 'dark'
}
