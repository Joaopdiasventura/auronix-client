export const objectToParams = (obj: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== '' && v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );
