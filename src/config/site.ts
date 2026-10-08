export const site = {
  name: "Brian Leckie",
  nickname: "Leki",
  wordmark: "leki.",
  role: "Desarrollador full-stack",
  employer: "Klien IT Systems",
  location: "Encarnación, Paraguay",
  whatsapp: "595983763890",
  whatsappMessage: "Hola Brian, vi tu portfolio y quiero consultarte por un proyecto.",
  email: "leckiebrian19@gmail.com",
  github: "https://github.com/brianleckie",
  linkedin: "https://linkedin.com/in/brianleckie",
  instagram: "",
  showDesignCredit: true,
  showPrices: false,               // true + fromPrice en services.ts para mostrar "desde X"
  url: "https://portfolio-alpha-henna-61.vercel.app", // ÚNICO lugar con la URL del sitio (canonical, OG, sitemap, robots)
};

export function whatsappHref(message: string = site.whatsappMessage): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
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
