import { Handlers } from '../utils/Handlers';

/**
 * Craft's core event handlers
 * Connectors are created from the handlers defined here
 */
export class CoreEventHandlers extends Handlers {
  /**
   * Create a new instance of Handlers with reference to the current EventHandlers
   * @param type A class that extends DerivedEventHandlers
   * @param args Additional arguments to pass to the constructor
   */
  derive(
    type,
    ...args
  ) {
    return new type(this.store, this, ...args);
  }
}

/**
 *  Allows for external packages to easily extend and derive the CoreEventHandlers
 */
export class DerivedEventHandlers extends Handlers{
  derived;

  constructor(store, derived) {
    super(store);
    this.derived = derived;
  }
}

