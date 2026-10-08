// Plugin remark: el sitio nunca muestra "TODO". Borra del cuerpo de los .md los
// párrafos que empiezan con `TODO:` y los headings que se quedan sin contenido.

function textOf(node) {
  if (typeof node.value === 'string') return node.value;
  return (node.children ?? []).map(textOf).join('');
}

const isTodoNode = (node) => node.type === 'paragraph' && /^TODO:?/i.test(textOf(node).trim());

export function remarkStripTodo() {
  return (tree) => {
    const sections = [];
    let current = { heading: null, nodes: [] };
    for (const node of tree.children) {
      if (node.type === 'heading') {
        sections.push(current);
        current = { heading: node, nodes: [] };
      } else {
        current.nodes.push(node);
      }
    }
    sections.push(current);

    tree.children = sections.flatMap(({ heading, nodes }) => {
      const kept = nodes.filter((n) => !isTodoNode(n));
      if (heading && kept.length === 0) return [];
      return heading ? [heading, ...kept] : kept;
    });
  };
}
