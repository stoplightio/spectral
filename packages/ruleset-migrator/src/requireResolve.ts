export default <NodeRequire['resolve'] | null>((id, opts) => {
  try {
    return require.resolve(id, opts);
  } catch {
    return null;
  }
});
