export const toKebabCase = (string: string): string => {
  if (!string) return '';
  
  // First, handle camelCase to kebab-case
  const withDashes = string.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
  
  // Then normalize spaces and other characters
  return withDashes
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with single dash
    .replace(/[^\w-]+/g, '') // Remove non-word chars except dashes
    .toLowerCase()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}
