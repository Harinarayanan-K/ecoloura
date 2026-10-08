/** Resolve public files for both domain-root and subdirectory static hosting. */
export function publicAsset(path: string) {
  if (/^(?:https?:|data:|blob:)/i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
