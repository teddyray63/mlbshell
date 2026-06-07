/**
 * playerPhoto — MLB headshot URL helper. Photos are served by the public MLB
 * media CDN keyed on the numeric MLB person id; non-numeric ids return a
 * generic silhouette so the UI never shows a broken image.
 */

export function playerPhotoUrl(mlbId: string | number | undefined | null): string {
  const id = String(mlbId ?? '');
  if (!/^\d+$/.test(id)) {
    return 'https://img.mlbstatic.com/mlb-photos/image/upload/w_180,q_100/v1/people/0/headshot/67/current';
  }
  return `https://img.mlbstatic.com/mlb-photos/image/upload/w_180,q_100/v1/people/${id}/headshot/67/current`;
}

export default playerPhotoUrl;
