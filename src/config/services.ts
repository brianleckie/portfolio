import { t } from '../i18n/ui';
import type { Locale } from '../i18n/routes';

export function getServices(locale: Locale) {
  const ui = t(locale);
  return [
    { title: ui.websTitle, description: ui.websDescription },
    { title: ui.sistemasTitle, description: ui.sistemasDescription },
    { title: ui.integracionesTitle, description: ui.integracionesDescription },
    { title: ui.itTitle, description: ui.itDescription },
  ];
}
