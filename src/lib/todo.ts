import { isTodo } from '../config/site';

/** Devuelve el texto si es un dato real; null si está vacío o es un `TODO:`. */
export function clean(value: string | undefined | null): string | null {
  if (value == null) return null;
  const v = value.trim();
  return isTodo(v) ? null : v;
}

/** Filtra los items vacíos o `TODO:` de una lista. */
export function cleanList(values: readonly string[] | undefined | null): string[] {
  return (values ?? []).map(clean).filter((v): v is string => v !== null);
}
