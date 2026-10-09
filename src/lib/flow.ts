/** Íconos genéricos (trazo propio, 24×24) para los nodos del diagrama. Nunca logos de terceros. */
export const FLOW_ICON_PATHS = {
  sistema: 'M3 4h18v12H3z M8 20h8 M12 16v4',
  datos: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  codigo: 'M8 4H7a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h1 M16 4h1a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-1',
  servidor: 'M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01',
  tienda: 'M3 9l2-5h14l2 5 M4 9v11h16V9 M3 9h18 M10 20v-5h4v5',
  mapa: 'M12 21s-7-6-7-11.5a7 7 0 0 1 14 0C19 15 12 21 12 21Z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  modelo: 'M4 4v16h16 M7 16l11-9 M8 11h.01 M11 15h.01 M14 9h.01 M17 13h.01',
  precio: 'M3 12V3h9l9 9-9 9-9-9Z M7.5 7.5h.01',
  despliegue: 'M12 15V3 M7 8l5-5 5 5 M4 15v5h16v-5',
  sucursal: 'M4 21V9l8-6 8 6v12 M9 21v-6h6v6 M3 21h18',
} as const;

export type FlowIcon = keyof typeof FLOW_ICON_PATHS;
export const FLOW_ICONS = Object.keys(FLOW_ICON_PATHS) as [FlowIcon, ...FlowIcon[]];
