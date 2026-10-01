

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.C119p2go.js","_app/immutable/chunks/DaRLt2T-.js","_app/immutable/chunks/GForqt4i.js"];
export const stylesheets = ["_app/immutable/assets/2.Bm_XsFgw.css"];
export const fonts = [];
