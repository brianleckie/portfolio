// Cualquier <a data-filter="web"> (teclado, servicios…) aplica el filtro de proyectos.
// Sin JS el link funciona igual: lleva a #proyectos.
export function bindFilterLinks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLAnchorElement>('a[data-filter]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const filter = a.dataset.filter;
      if (!filter || !document.getElementById('proyectos')) return;
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('kb:filter', { detail: { filter } }));
    });
  });
}
