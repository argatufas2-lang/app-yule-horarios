

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.BJEmJv3l.js","_app/immutable/chunks/DaRLt2T-.js","_app/immutable/chunks/GForqt4i.js","_app/immutable/chunks/DPRDLum_.js"];
export const stylesheets = [];
export const fonts = [];
