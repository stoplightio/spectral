// this function makes sure we can only have one plugin with the same name
// the last plugin definition has a precedence
import type { Plugin } from 'rollup';

export function dedupeRollupPlugins(plugins: Plugin[]): Plugin[] {
  const map = new Map<string, Plugin>();
  for (const plugin of plugins) {
    map.set(plugin.name, plugin);
  }

  return Array.from(map.values());
}
