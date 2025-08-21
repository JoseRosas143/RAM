import React, { createContext, useContext, useState, useCallback } from 'react';
import es from './locales/es.json';
import en from './locales/en.json';

// Translation resources keyed by language code
const resources = { es, en };

const TranslationContext = createContext({
  t: (key, vars) => key,
  language: 'es',
  setLanguage: () => {}
});

/**
 * Recursively look up a dot-notated key in an object.  If not found,
 * return undefined.
 */
function lookup(key, obj) {
  return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

/**
 * Replace Handlebars-like variables in a string with values from the
 * provided dictionary.  For example: "Hola, {{name}}" with { name:
 * "Pedro" } yields "Hola, Pedro".
 */
function interpolate(str, vars = {}) {
  return str.replace(/\{\{(.*?)\}\}/g, (_, v) => (vars[v.trim()] !== undefined ? vars[v.trim()] : `{{${v}}}`));
}

export function TranslationProvider({ children, defaultLanguage = 'es' }) {
  const [language, setLanguage] = useState(defaultLanguage);

  const t = useCallback(
    (key, vars) => {
      const entry = lookup(key, resources[language] || {});
      if (typeof entry === 'string') {
        return interpolate(entry, vars);
      }
      return entry !== undefined ? entry : key;
    },
    [language]
  );

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook to access the current translation function and language.  Returns
 * an object with `t` to translate keys, the active `language` and
 * `setLanguage` to switch languages.
 */
export function useTranslation() {
  return useContext(TranslationContext);
}