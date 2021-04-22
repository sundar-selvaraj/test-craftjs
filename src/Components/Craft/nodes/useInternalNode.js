import { useMemo, useContext } from 'react';

import { NodeContext } from './NodeContext';

import { useInternalEditor } from '../editor/useInternalEditor';


// export function useInternalNode();
// export function useInternalNode(
//   collect
// );
export function useInternalNode(
  collect
) {
  const context = useContext(NodeContext);
  const { id, related, connectors } = context;

  const { actions: EditorActions, query, ...collected } = useInternalEditor(
    (state) => id && state.nodes[id] && collect && collect(state.nodes[id])
  );

  const actions = useMemo(() => {
    return {
      setProp: (cb, throttleRate) => {
        if (throttleRate) {
          EditorActions.history.throttle(throttleRate).setProp(id, cb);
        } else {
          EditorActions.setProp(id, cb);
        }
      },
      setCustom: (cb, throttleRate) => {
        if (throttleRate) {
          EditorActions.history.throttle(throttleRate).setCustom(id, cb);
        } else {
          EditorActions.setCustom(id, cb);
        }
      },
      setHidden: (bool) => EditorActions.setHidden(id, bool),
    };
  }, [EditorActions, id]);

  return {
    ...(collected),
    id,
    related,
    inNodeContext: !!context,
    actions,
    connectors,
  };
}
