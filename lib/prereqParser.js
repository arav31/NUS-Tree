function parsePrerequisite(text = '') {
  const moduleCodes = text
    .toUpperCase()
    .match(/[A-Z]{2,4}\d{4}[A-Z]?/g);

  return {
    raw: text,
    modules: [...new Set(moduleCodes || [])],
    hasAnd: /\band\b/i.test(text),
    hasOr: /\bor\b/i.test(text),
  };
}

module.exports = { parsePrerequisite };
