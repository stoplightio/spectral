import { createRequire } from 'module';

export default <NodeRequire['resolve'] | null>((id, opts) => {
  try {
    const req = createRequire(process.cwd());
    return req.resolve(id, opts);
  } catch {
    return null;
  }
});
