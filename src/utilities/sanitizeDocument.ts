import { ObjectId, Binary } from 'bson';

export const sanitizeDocument = <T extends Record<string, any>>(doc: T): T => {
  const sanitizeValue = (value: any): any => {
    if (value instanceof ObjectId) {
      return value.toHexString();
    }
    
    if (value instanceof Binary) {
      return Array.from(value.value());
    }

    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }

    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)])
      );
    }

    return value;
  };

  return Object.fromEntries(
    Object.entries(doc).map(([key, value]) => [key, sanitizeValue(value)])
  ) as T;
};