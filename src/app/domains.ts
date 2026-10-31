export interface Domain {
  slug: string;
  label: string;
  icon: string;
  color: string;
}

// Slugs and labels come from the OpenRift catalog (enums.domains); icons are saved copies of
// https://openrift.app/images/domains/{slug}.webp and colors are sampled from those icons.
export const DOMAINS: Domain[] = [
  { slug: 'fury', label: 'Fury', icon: 'domains/fury.webp', color: '#d01820' },
  { slug: 'calm', label: 'Calm', icon: 'domains/calm.webp', color: '#488838' },
  { slug: 'mind', label: 'Mind', icon: 'domains/mind.webp', color: '#0868a0' },
  { slug: 'body', label: 'Body', icon: 'domains/body.webp', color: '#e87000' },
  { slug: 'chaos', label: 'Chaos', icon: 'domains/chaos.webp', color: '#603888' },
  { slug: 'order', label: 'Order', icon: 'domains/order.webp', color: '#c8a810' },
];

export const DEFAULT_COLORS: [string, string] = ['#ffc83d', '#ff6a00'];

export function colorsFor(slugs: string[]): [string, string] {
  const colors = slugs.map((s) => DOMAINS.find((d) => d.slug === s)?.color).filter((c): c is string => !!c);
  if (colors.length === 0) return DEFAULT_COLORS;
  return [colors[0], colors[1] ?? colors[0]];
}
