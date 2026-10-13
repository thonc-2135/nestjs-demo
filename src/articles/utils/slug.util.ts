import { randomUUID } from 'node:crypto';
import slugify from 'slugify';

export function generateSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true });
  const suffix = randomUUID().slice(0, 8);
  return `${base}-${suffix}`;
}
