export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatQuantity = (num: number): string => {
  return Number.isInteger(num) ? num.toString() : num.toFixed(2).replace(/\.00$/, '');
};