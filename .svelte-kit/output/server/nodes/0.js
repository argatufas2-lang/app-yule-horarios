

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.Cu77GY9-.js","_app/immutable/chunks/DaRLt2T-.js","_app/immutable/chunks/GForqt4i.js"];
export const stylesheets = ["_app/immutable/assets/0.BKaQxp34.css"];
export const fonts = [];
