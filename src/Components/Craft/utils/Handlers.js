import { wrapHookToRecognizeElement } from '../../Utils';


export const defineEventListener = (
  name,
  handler,
  capture
) => [name, handler, capture];

/**
 * Check if a specified event is blocked by a child
 * that's a descendant of the specified element
 */
const isEventBlockedByDescendant = (e, eventName, el) => {
  // TODO: Update TS to use optional chaining
  const blockingElements = (e.craft && e.craft.blockedEvents[eventName]) || [];

  for (let i = 0; i < blockingElements.length; i++) {
    const blockingElement = blockingElements[i];

    if (el !== blockingElement && el.contains(blockingElement)) {
      return true;
    }
  }

  return false;
};

/**
 * Attaches/detaches a Handler to a DOM element
 * The handler is attached/detached depending on the enabled state from the `store`
 */
class WatchHandler {
  el
  opts

  handler;
  unsubscribe;
  cleanDOM;
  listenersToRemove;

  constructor(store, el, opts, handler) {
    this.el = el;
    this.opts = opts;
    this.handler = handler;

    this.unsubscribe = store.subscribe(
      (state) => ({ enabled: state.options.enabled }),
      ({ enabled }) => {
        if (!el.ownerDocument.body.contains(el)) {
          this.remove();
          return this.unsubscribe();
        }

        if (enabled) {
          this.add();
        } else {
          this.remove();
        }
      },
      true
    );
  }

  add() {
    const { init, events } = this.handler;

    this.cleanDOM = init && init(this.el, this.opts);
    this.listenersToRemove =
      events &&
      events.map(([eventName, listener, capture]) => {
        const bindedListener = (e) => {
          // Store initial Craft event value
          if (!e.craft) {
            e.craft = {
              blockedEvents: {},
              stopPropagation: () => {},
            };
          }

          if (!isEventBlockedByDescendant(e, eventName, this.el)) {
            e.craft.stopPropagation = () => {
              if (!e.craft.blockedEvents[eventName]) {
                e.craft.blockedEvents[eventName] = [];
              }

              e.craft.blockedEvents[eventName].push(this.el);
            };

            listener(e, this.opts);
          }
        };

        this.el.addEventListener(eventName, bindedListener, capture);

        return () =>
          this.el.removeEventListener(eventName, bindedListener, capture);
      });
  }

  remove() {
    if (this.cleanDOM) {
      this.cleanDOM();
      this.cleanDOM = null;
    }

    if (this.listenersToRemove) {
      this.listenersToRemove.forEach((l) => l());
      this.listenersToRemove = null;
    }
  }
}

/**
 * Creates Event Handlers
 */
export class Handlers {
  // Stores a map of DOM elements to their attached connector's WatchHandler
  wm = new WeakMap();
  // Data store to infer the enabled state from
 store;

  constructor(store) {
    this.store = store;
  }

  // handlers();

  // Returns ref connectors for handlers
  connectors() {
    const initialHandlers = this.handlers() || {};

    return Object.keys(initialHandlers).reduce((accum, key) => {
      const { init, events } = initialHandlers[key];

      if (!init && !events) {
        accum[key] = () => {};
        return accum;
      }

      const connector = (el, opts) => {
        if (!el || !el.ownerDocument.body.contains(el)) {
          this.wm.delete(el);
          return;
        }

        const domHandler = this.wm.get(el);

        if (domHandler && domHandler[key]) {
          return;
        }

        this.wm.set(el, {
          ...domHandler,
          [key]: new WatchHandler(this.store, el, opts, {
            init,
            events,
          }),
        });
      };

      accum[key] = wrapHookToRecognizeElement(connector);
      return accum;
    }, {});
  }

  getConnectors(
    This,
    ...args
  ) {
    const that = new This(...args);
    return that.connectors();
  }
}
