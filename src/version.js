// A short fingerprint of every stylesheet and script. Asset links carry it as ?v=...,
// so a browser that cached an older stylesheet fetches the new one after each deploy.
import { CSS, JS, THEME_JS } from './assets.js';
import { ADMIN_CSS, ADMIN_JS } from './admin-assets.js';
import { TAROT_CSS, TAROT_JS } from './tarot-assets.js';

function fingerprint(text) {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(36);
}

export const ASSET_VERSION = fingerprint([CSS, JS, THEME_JS, ADMIN_CSS, ADMIN_JS, TAROT_CSS, TAROT_JS].join('|'));
