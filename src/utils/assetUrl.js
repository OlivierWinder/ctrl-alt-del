function encodePath(path) {
  return path
    .split('/')
    .map((segment) => {
      if (!segment) return segment;
      try {
        // Avoid double-encoding if a path was already escaped.
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join('/');
}

export function assetUrl(path) {
  if (!path) return path;
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${encodePath(normalized)}`;
}
