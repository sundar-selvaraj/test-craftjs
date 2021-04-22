import { DerivedEventHandlers } from '../events';

/**
 * Creates Node-specific event handlers and connectors
 */
export class NodeHandlers extends DerivedEventHandlers {
  id;

  constructor(store, derived, nodeId) {
    super(store, derived);
    this.id = nodeId;
  }

  handlers() {
    const parentConnectors = this.derived.connectors();
    return {
      connect: {
        init: (el) => {
          parentConnectors.connect(el, this.id);
        },
      },
      drag: {
        init: (el) => {
          parentConnectors.drag(el, this.id);
        },
      },
    };
  }
}
