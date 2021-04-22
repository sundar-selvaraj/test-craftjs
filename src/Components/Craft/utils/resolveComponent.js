
import { Canvas } from '../nodes/Canvas';

export const resolveComponent = (
  resolver,
  comp
) => {
  let Comp;
  const name = (comp).name || (comp).displayName;

  if (comp === Canvas) return 'Canvas';

  if (resolver[name]) return name;

  for (let i = 0; i < Object.keys(resolver).length; i++) {
    const name = Object.keys(resolver)[i],
      fn = resolver[name];
    if (fn === comp) {
      Comp = name;
      return Comp;
    }
  }

  if (typeof comp === 'string') return comp;
};
