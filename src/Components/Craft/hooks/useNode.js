
import {
  useInternalNode,
} from '../nodes/useInternalNode';
import { deprecationWarning } from '../../Utils';

// export function useNode();

// export function useNode(
//   collect
// );

/**
 * A Hook to that provides methods and state information related to the corresponding Node that manages the current component.
 * @param collect - Collector function to consume values from the corresponding Node's state
 */
export function useNode(
  collect
) {
  const {
    id,
    related,
    actions,
    inNodeContext,
    connectors,
    ...collected
  } = useInternalNode(collect);

  return {
    ...(collected),
    actions,
    id,
    related,
    setProp: (cb) => {
      deprecationWarning('useNode().setProp()', {
        suggest: 'useNode().actions.setProp()',
      });
      return actions.setProp(cb);
    },
    inNodeContext,
    connectors,
  };
}
