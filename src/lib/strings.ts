/**
 * Strips diacritical marks (umlauts, accents, etc.) and lowercases a string
 * so that "Motley Crue" matches "Mötley Crüe" in comparisons.
 */
export function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}
