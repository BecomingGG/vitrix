/**
 * Accepts a YouTube link (watch?v=, youtu.be/, /embed/, /shorts/, /live/) or a bare 11-character
 * id and returns the id, or null if it isn't one. Only ids that match this exact pattern are ever
 * put into an embed URL.
 */
export function youtubeId(input: string | null | undefined): string | null {
  const value = (input ?? '').trim();
  if (!value) {
    return null;
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) {
    return value;
  }
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\.|^m\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') {
      id = url.pathname.slice(1, 12);
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id =
        url.searchParams.get('v') ??
        url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/)?.[1] ??
        null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Privacy-friendly embed (no tracking cookies until the visitor presses play). */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}
