let dict: Record<string, string> = {};

export const setTranslations = (d: Record<string, string>) => {
  dict = { ...d };
};

export const mergeTranslations = (d: Record<string, string>) => {
  dict = { ...dict, ...d };
};

export const resetTranslations = () => {
  dict = {};
};

export const t = (key: string) => dict[key] ?? key;
