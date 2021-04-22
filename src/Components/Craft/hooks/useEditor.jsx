import { useMemo } from 'react';

import {
  useInternalEditor,
} from '../editor/useInternalEditor';


const getPublicActions = (actions) => {
  const {
    addLinkedNodeFromTree,
    setDOM,
    setNodeEvent,
    replaceNodes,
    reset,
    ...EditorActions
  } = actions;

  return EditorActions;
};


/**
 * A Hook that that provides methods and information related to the entire editor state.
 * @param collector Collector function to consume values from the editor's state
 */
// export function useEditor();
// export function useEditor(
//   collect
// );

export function useEditor(collect) {
  const {
    connectors,
    actions: internalActions,
    query: { deserialize, ...query },
    store,
    ...collected
  } = useInternalEditor(collect);

  const EditorActions = getPublicActions(internalActions);

  const actions = useMemo(() => {
    return {
      ...EditorActions,
      history: {
        ...EditorActions.history,
        ignore: (...args) =>
          getPublicActions(EditorActions.history.ignore(...args)),
        throttle: (...args) =>
          getPublicActions(EditorActions.history.throttle(...args)),
      },
    };
  }, [EditorActions]);

  return {
    connectors,
    actions,
    query,
    store,
    ...(collected),
  };
}
