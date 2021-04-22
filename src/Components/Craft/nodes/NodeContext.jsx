import React, { useMemo } from 'react';

import { NodeHandlers } from './NodeHandlers';

import { useInternalEditor } from '../editor/useInternalEditor';
import { useEventHandler } from '../events';

export const NodeContext = React.createContext(null);

export const NodeProvider = ({
  id,
  related = false,
  children,
}) => {
  const handlers = useEventHandler();

  const { hydrationTimestamp } = useInternalEditor((state) => ({
    hydrationTimestamp: state.nodes[id] && state.nodes[id]._hydrationTimestamp,
  }));

  // Get fresh connectors whenever the Nodes are rehydrated (eg: after deserialisation)
  const connectors = useMemo(() => {
    return handlers.derive(NodeHandlers, id).connectors();
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [handlers, hydrationTimestamp, id]);

  return (
    <NodeContext.Provider value={{ id, related, connectors }}>
      {children}
    </NodeContext.Provider>
  );
};
