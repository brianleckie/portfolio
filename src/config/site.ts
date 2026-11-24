import { t } from '../i18n/ui';
import type { Locale } from '../i18n/routes';

export const site = {
  name: "Brian Leckie",
  nickname: "Leki",
  wordmark: "leki.",
  employer: "Klien IT Systems",
  company: "CPO Tech",
  photo: "",
  openToWork: false,
  enableEnglish: false,
  cpoTechUrl: "https://www.cpotech.com.py",
  location: "Encarnación, Paraguay",
  whatsapp: "595983763890",
  email: "leckiebrian19@gmail.com",
  github: "https://github.com/brianleckie",
  linkedin: "https://linkedin.com/in/brianleckie",
  instagram: "",
  url: "https://portfolio-alpha-henna-61.vercel.app", // ÚNICO lugar con la URL del sitio (canonical, OG, sitemap, robots)
};

export function whatsappHref(message?: string, locale: Locale = 'es'): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message ?? t(locale).whatsappMessage)}`;
}

export function isTodo(value: string): boolean {
  return value.startsWith("TODO:") || value === "";
}

export function resolveValue(value: string): string | null {
  if (isTodo(value)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[site.ts] TODO field not filled: "${value}"`);
    }
    return null;
  }
  return value;
}
