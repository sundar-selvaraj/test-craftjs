import invariant from 'tiny-invariant';


import { fromEntries } from '../utils/fromEntries';
import { removeNodeFromEvents } from '../utils/removeNodeFromEvents';
import {
  deprecationWarning,
  ERROR_INVALID_NODEID,
  ROOT_NODE,
  DEPRECATED_ROOT_NODE,
  ERROR_NOPARENT,
  ERROR_DELETE_TOP_LEVEL_NODE,
} from '../../Utils';

const Methods = (
  state,
  query
) => {
  /** Helper functions */
  const addNodeToParentAtIndex = (
    testNode,
    parentId,
    index
  ) => {
    const node = { ...testNode };
    let parent = getParentAndValidate(parentId);
    // reset the parent node ids
    if (!parent.data.nodes) {
      parent.data.nodes = [];
    }

    
    if (parent.data.props && parent.data.props.children) {
      const { children, ...rest } = parent.data.props;
      parent.data.props = { ...rest };
    }

    if (index != null) {
      parent.data.nodes.splice(index, 0, node.id);
    } else {
      parent.data.nodes.push(node.id);
    }

    node.data = {
      ...node.data,
      parent: parent.id
    };
    state.nodes[node.id] = node;
  };

  const addTreeToParentAtIndex = (
    tree,
    parentId,
    index
  ) => {
    let node = tree.nodes[tree.rootNodeId];
    console.log('node', node);

    if (parentId != null) {
      addNodeToParentAtIndex(node, parentId, index);
    }

    if (node.data.nodes) {
      const childToAdd = [...node.data.nodes];
      // node.data.nodes = [];
      childToAdd.forEach((childId, index) =>
        addTreeToParentAtIndex(
          { rootNodeId: childId, nodes: tree.nodes },
          node.id,
          index
        )
      );
    }

    if (node.data.linkedNodes) {
      Object.keys(node.data.linkedNodes).forEach((linkedId) => {
        const nodeId = node.data.linkedNodes[linkedId];
        state.nodes[nodeId] = tree.nodes[nodeId];
        addTreeToParentAtIndex({ rootNodeId: nodeId, nodes: tree.nodes });
      });
    }
  };

  const getParentAndValidate = (parentId) => {
    invariant(parentId, ERROR_NOPARENT);
    const parent = state.nodes[parentId];
    invariant(parent, ERROR_INVALID_NODEID);
    return parent;
  };

  const deleteNode = (id, isLinkedNode = false) => {
    const targetNode = state.nodes[id],
      parentNode = state.nodes[targetNode.data.parent];

    if (targetNode.data.nodes) {
      // we deep clone here because otherwise immer will mutate the node
      // object as we remove nodes
      [...targetNode.data.nodes].forEach((childId) => deleteNode(childId));
    }

    if (isLinkedNode && parentNode.data.linkedNodes) {
      const linkedId = Object.keys(parentNode.data.linkedNodes).filter(
        (id) => parentNode.data.linkedNodes[id] === id
      )[0];
      if (linkedId) {
        delete parentNode.data.linkedNodes[linkedId];
      }
    } else {
      const parentChildren = parentNode.data.nodes;
      parentChildren.splice(parentChildren.indexOf(id), 1);
    }

    removeNodeFromEvents(state, id);
    delete state.nodes[id];
  };

  return {
    /**
     * @private
     * Add a new linked Node to the editor.
     * Only used internally by the <Element /> component
     *
     * @param tree
     * @param parentId
     * @param id
     */
    addLinkedNodeFromTree(tree, parentId, id) {
      const parent = getParentAndValidate(parentId);
      if (!parent.data.linkedNodes) {
        parent.data.linkedNodes = {};
      }

      const existingLinkedNode = parent.data.linkedNodes[id];
      if (existingLinkedNode) {
        deleteNode(existingLinkedNode, true);
      }

      parent.data.linkedNodes[id] = tree.rootNodeId;

      tree.nodes[tree.rootNodeId].data.parent = parentId;
      state.nodes[tree.rootNodeId] = tree.nodes[tree.rootNodeId];

      addTreeToParentAtIndex(tree);
    },

    /**
     * Add a new Node to the editor.
     *
     * @param nodeToAdd
     * @param parentId
     * @param index
     */
    add(nodeToAdd, parentId, index) {
      // TODO: Deprecate adding array of Nodes to keep implementation simpler
      let nodes = [nodeToAdd];
      if (Array.isArray(nodeToAdd)) {
        deprecationWarning('actions.add(node: Node[])', {
          suggest: 'actions.add(node: Node)',
        });
        nodes = nodeToAdd;
      }
      nodes.forEach((node) => {
        addNodeToParentAtIndex(node, parentId, index);
      });
    },

    /**
     * Add a NodeTree to the editor
     *
     * @param tree
     * @param parentId
     * @param index
     */
    addNodeTree(tree, parentId, index) {
      const node = tree.nodes[tree.rootNodeId];

      if (!parentId) {
        invariant(
          tree.rootNodeId === ROOT_NODE,
          'Cannot add non-root Node without a parent'
        );
        state.nodes[tree.rootNodeId] = node;
      }

      addTreeToParentAtIndex(tree, parentId, index);
    },

    /**
     * Delete a Node
     * @param id
     */
    delete(id) {
      invariant(!query.node(id).isTopLevelNode(), ERROR_DELETE_TOP_LEVEL_NODE);

      deleteNode(id);
    },

    deserialize(input) {
      const dehydratedNodes =
        typeof input == 'string' ? JSON.parse(input) : input;

      const nodePairs = Object.keys(dehydratedNodes).map((id) => {
        let nodeId = id;

        if (id === DEPRECATED_ROOT_NODE) {
          nodeId = ROOT_NODE;
        }

        return [
          nodeId,
          query
            .parseSerializedNode(dehydratedNodes[id])
            .toNode((node) => (node.id = nodeId)),
        ];
      });

      this.replaceNodes(fromEntries(nodePairs));
    },
    /**
     * Move a target Node to a new Parent at a given index
     * @param targetId
     * @param newParentId
     * @param index
     */
    move(targetId, newParentId, index) {
      const targetNode = state.nodes[targetId],
        currentParentId = targetNode.data.parent,
        newParent = state.nodes[newParentId],
        newParentNodes = newParent.data.nodes;

      query.node(newParentId).isDroppable(targetNode, (err) => {
        throw new Error(err);
      });

      const currentParent = state.nodes[currentParentId],
        currentParentNodes = currentParent.data.nodes;

      currentParentNodes[currentParentNodes.indexOf(targetId)] = 'marked';

      newParentNodes.splice(index, 0, targetId);

      state.nodes[targetId].data.parent = newParentId;
      currentParentNodes.splice(currentParentNodes.indexOf('marked'), 1);
    },

    replaceNodes(nodes) {
      this.clearEvents();
      state.nodes = nodes;
    },

    clearEvents() {
      this.setNodeEvent('selected', null);
      this.setNodeEvent('hovered', null);
      this.setNodeEvent('dragged', null);
      this.setIndicator(null);
    },

    /**
     * Resets all the editor state.
     */
    reset() {
      this.clearEvents();
      this.replaceNodes({});
    },

    /**
     * Set editor options via a callback function
     *
     * @param cb: function used to set the options.
     */
    setOptions(cb) {
      cb(state.options);
    },

    setNodeEvent(eventType, id) {
      const current = state.events[eventType];
      if (current && id !== current) {
        state.nodes[current].events[eventType] = false;
      }

      if (id) {
        state.nodes[id].events[eventType] = true;
        state.events[eventType] = id;
      } else {
        state.events[eventType] = null;
      }
    },

    /**
     * Set custom values to a Node
     * @param id
     * @param cb
     */
    setCustom(
      id,
      cb
    ) {
      cb(state.nodes[id].data.custom);
    },

    /**
     * Given a `id`, it will set the `dom` porperty of that node.
     *
     * @param id of the node we want to set
     * @param dom
     */
    setDOM(id, dom) {
      if (!state.nodes[id]) {
        return;
      }

      state.nodes[id].dom = dom;
    },

    setIndicator(indicator) {
      if (
        indicator &&
        (!indicator.placement.parent.dom ||
          (indicator.placement.currentNode &&
            !indicator.placement.currentNode.dom))
      )
        return;
      state.events.indicator = indicator;
    },

    /**
     * Hide a Node
     * @param id
     * @param bool
     */
    setHidden(id, bool) {
      state.nodes[id].data.hidden = bool;
    },

    /**
     * Update the props of a Node
     * @param id
     * @param cb
     */
    setProp(id, cb) {
      invariant(state.nodes[id], ERROR_INVALID_NODEID);
      cb(state.nodes[id].data.props);
    },

    selectNode(nodeId) {
      // TODO: use ts strict-null checks
      this.setNodeEvent(
        'selected',
        nodeId !== undefined && nodeId !== null ? nodeId : null
      );
      this.setNodeEvent('hovered', null);
    },
  };
};

export const ActionMethods = (
  state,
  query
) => {
  return {
    ...Methods(state, query),
    // Note: Beware: advanced method! You most likely don't need to use this
    // TODO: fix parameter types and cleanup the method
    setState(
      cb
    ) {
      const { history, ...actions } = this;

      // We pass the other actions as the second parameter, so that devs could still make use of the predefined actions
      cb(state, actions);
    },
  };
};
