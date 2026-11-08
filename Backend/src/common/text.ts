export function capitalizeCase(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/\S+/g, (palabra) => {
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    });
}