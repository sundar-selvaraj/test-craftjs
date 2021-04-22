import { CoreEventHandlers } from './CoreEventHandlers';
import { createShadow } from './createShadow';

import { defineEventListener } from '../utils/Handlers';

export * from '../utils/Handlers';


/**
 * Specifies Editor-wide event handlers and connectors
 */
export class DefaultEventHandlers extends CoreEventHandlers {
  static draggedElementShadow;
  static draggedElement;
  static indicator = null;

  // Safely run handler if Node Id exists
  defineNodeEventListener(
    eventName,
    handler,
    capture
  ) {
    return defineEventListener(
      eventName,
      (e, id) => {
        if (id) {
          const node = this.store.query.node(id).get();
          if (!node) {
            return;
          }
        }

        handler(e, id);
      },
      capture
    );
  }

  handlers() {
    return {
      connect: {
        init: (el, id) => {
          this.connectors().select(el, id);
          this.connectors().hover(el, id);
          this.connectors().drop(el, id);
          this.store.actions.setDOM(id, el);
        },
      },
      select: {
        init: () => () => this.store.actions.setNodeEvent('selected', null),
        events: [
          this.defineNodeEventListener(
            'mousedown',
            (e, id) => {
              e.craft.stopPropagation();
              this.store.actions.setNodeEvent('selected', id);
            }
          ),
        ],
      },
      hover: {
        init: () => () => this.store.actions.setNodeEvent('hovered', null),
        events: [
          this.defineNodeEventListener(
            'mouseover',
            (e, id) => {
              e.craft.stopPropagation();
              this.store.actions.setNodeEvent('hovered', id);
            }
          ),
        ],
      },
      drop: {
        events: [
          defineEventListener('dragover', (e) => {
            e.craft.stopPropagation();
            e.preventDefault();
          }),
          this.defineNodeEventListener(
            'dragenter',
            (e, targetId) => {
              e.craft.stopPropagation();
              e.preventDefault();

              const draggedElement = DefaultEventHandlers.draggedElement;
              if (!draggedElement) {
                return;
              }

              let node = (draggedElement);

              if ((draggedElement).rootNodeId) {
                const nodeTree = draggedElement;
                node = nodeTree.nodes[nodeTree.rootNodeId];
              }

              const { clientX: x, clientY: y } = e;
              const indicator = this.store.query.getDropPlaceholder(
                node,
                targetId,
                { x, y }
              );

              if (!indicator) {
                return;
              }
              this.store.actions.setIndicator(indicator);
              DefaultEventHandlers.indicator = indicator;
            }
          ),
        ],
      },

      drag: {
        init: (el, id) => {
          if (!this.store.query.node(id).isDraggable()) {
            return () => {};
          }

          el.setAttribute('draggable', 'true');
          return () => el.setAttribute('draggable', 'false');
        },
        events: [
          this.defineNodeEventListener(
            'dragstart',
            (e, id) => {
              e.craft.stopPropagation();
              this.store.actions.setNodeEvent('dragged', id);

              DefaultEventHandlers.draggedElementShadow = createShadow(e);
              DefaultEventHandlers.draggedElement = id;
            }
          ),
          defineEventListener('dragend', (e) => {
            e.craft.stopPropagation();
            const onDropElement = (draggedElement, placement) => {
              const index =
                placement.index + (placement.where === 'after' ? 1 : 0);
              this.store.actions.move(
                draggedElement,
                placement.parent.id,
                index
              );
            };
            this.dropElement(onDropElement);
          }),
        ],
      },
      create: {
        init: (el) => {
          el.setAttribute('draggable', 'true');
          return () => el.removeAttribute('draggable');
        },
        events: [
          defineEventListener(
            'dragstart',
            (e, userElement) => {
              e.craft.stopPropagation();
              const tree = this.store.query
                .parseReactElement(userElement)
                .toNodeTree();

              DefaultEventHandlers.draggedElementShadow = createShadow(e);
              DefaultEventHandlers.draggedElement = tree;
            }
          ),
          defineEventListener('dragend', (e) => {
            e.craft.stopPropagation();
            const onDropElement = (draggedElement, placement) => {
              const index =
                placement.index + (placement.where === 'after' ? 1 : 0);
              this.store.actions.addNodeTree(
                draggedElement,
                placement.parent.id,
                index
              );
            };
            this.dropElement(onDropElement);
          }),
        ],
      },
    };
  }

  dropElement(
    onDropNode
  ) {
    const {
      draggedElement,
      draggedElementShadow,
      indicator,
    } = DefaultEventHandlers;
    if (draggedElement && indicator && !indicator.error) {
      const { placement } = indicator;
      onDropNode(draggedElement, placement);
    }

    if (draggedElementShadow) {
      draggedElementShadow.parentNode.removeChild(draggedElementShadow);
      DefaultEventHandlers.draggedElementShadow = null;
    }

    DefaultEventHandlers.draggedElement = null;
    DefaultEventHandlers.indicator = null;

    this.store.actions.setIndicator(null);
    this.store.actions.setNodeEvent('dragged', null);
  }
}
