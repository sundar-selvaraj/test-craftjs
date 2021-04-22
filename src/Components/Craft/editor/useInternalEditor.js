import { useContext, useMemo } from 'react';

import { EditorContext } from './EditorContext';

import { useEventHandler } from '../events/EventContext';
import { useCollector } from '../../Utils';


// export function useInternalEditor();
// export function useInternalEditor(
//   collector
// );
export function useInternalEditor(
  collector
) {
  const handlers = useEventHandler();
  const store = useContext(EditorContext);
  const collected = useCollector(store, collector);

  const connectors = useMemo(() => handlers && handlers.connectors(), [
    handlers,
  ]);

  return {
    ...(collected),
    connectors: connectors || {},
    inContext: !!store,
    store,
  };
}
