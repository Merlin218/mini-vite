function reWriteImport(content) {
  return content.replace(/ from ['"](.*)['"]/g, (s1, s2) => {
    if (s2.startsWith('./') || s2.startsWith('../') || s2.startsWith('/')) {
      return s1;
    }
    return ` from '/@modules/${s2}'`;
  });
}

module.exports = { reWriteImport };
