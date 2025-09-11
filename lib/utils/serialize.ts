export const serialize = (v: unknown) => {
  try {
    return encodeURIComponent(JSON.stringify(v ?? {}));
  } catch {
    return encodeURIComponent('{}');
  }
};
