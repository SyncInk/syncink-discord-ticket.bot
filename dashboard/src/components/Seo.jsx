import { useEffect } from 'react';

const DEFAULT_IMAGE = '/ticket-logo.png';
const DEFAULT_ROBOTS = 'index,follow';
const DEFAULT_SITE_NAME = 'SyncInk Ticket';
const DEFAULT_THEME_COLOR = '#050508';

function upsertMeta(attribute, key, content) {
  if (!content) return;

  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function upsertSchema(schema) {
  const existing = document.getElementById('syncink-seo-schema');

  if (!schema) {
    existing?.remove();
    return;
  }

  const element = existing || document.createElement('script');
  element.id = 'syncink-seo-schema';
  element.type = 'application/ld+json';
  element.textContent = JSON.stringify(schema);

  if (!existing) {
    document.head.appendChild(element);
  }
}

export default function Seo({
  title,
  description,
  path = '/',
  canonicalPath,
  image = DEFAULT_IMAGE,
  robots = DEFAULT_ROBOTS,
  keywords,
  type = 'website',
  schema
}) {
  useEffect(() => {
    const origin = window.location.origin;
    const resolvedCanonical = new URL(canonicalPath || path, origin).toString();
    const resolvedImage = new URL(image, origin).toString();

    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'theme-color', DEFAULT_THEME_COLOR);
    upsertMeta('name', 'keywords', keywords);

    upsertMeta('property', 'og:site_name', DEFAULT_SITE_NAME);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', resolvedCanonical);
    upsertMeta('property', 'og:image', resolvedImage);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', resolvedImage);

    upsertLink('canonical', resolvedCanonical);
    upsertSchema(schema);
  }, [canonicalPath, description, image, keywords, path, robots, schema, title, type]);

  return null;
}
