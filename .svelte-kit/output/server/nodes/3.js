

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/import/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.D223t1Ko.js","_app/immutable/chunks/DaRLt2T-.js","_app/immutable/chunks/GForqt4i.js"];
export const stylesheets = [];
export const fonts = [];
