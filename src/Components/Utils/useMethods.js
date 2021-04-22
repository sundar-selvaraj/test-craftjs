// https://github.com/pelotom/use-methods
import produce, { produceWithPatches } from 'immer';
import isEqualWith from 'lodash/isEqualWith';
import { useMemo, useEffect, useRef, useReducer, useCallback } from 'react';

import { History, HISTORY_ACTIONS } from './History';

export const SubscriberAndCallbacksFor = (
  M,
  Q
) => ({
  subscribe: new Watcher(M)['subscribe'],
  getState: () => {},
  actions: M,
  query: Q,
  history: History
});

// export function useMethods(
//   methodsOrOptions, // methods to manipulate the state
//   initialState
// );

// export function useMethods(
//   methodsOrOptions, // methods to manipulate the state
//   initialState,
//   queryMethods
// );

// export function useMethods(
//   methodsOrOptions, // methods to manipulate the state
//   initialState,
//   queryMethods,
//   patchListener
// );

export function useMethods(
  methodsOrOptions,
  initialState,
  queryMethods,
  patchListener
) {
  const history = useMemo(() => new History(), []);

  let methods;
  let ignoreHistoryForActionsRef = useRef([]);
  let normalizeHistoryRef = useRef();

  if (typeof methodsOrOptions === 'function') {
    methods = methodsOrOptions;
  } else {
    methods = methodsOrOptions.methods;
    ignoreHistoryForActionsRef.current = methodsOrOptions.ignoreHistoryForActions;
    normalizeHistoryRef.current = methodsOrOptions.normalizeHistory;
  }

  const patchListenerRef = useRef(patchListener);
  patchListenerRef.current = patchListener;

  const [reducer, methodsFactory] = useMemo(() => {
    const { current: normalizeHistory } = normalizeHistoryRef;
    const { current: ignoreHistoryForActions } = ignoreHistoryForActionsRef;
    const { current: patchListener } = patchListenerRef;

    return [
      (state, action) => {
        const query =
          queryMethods && createQuery(queryMethods, () => state, history);

        let finalState;
        let [nextState, patches, inversePatches] = (produceWithPatches)(
          state,
          (draft) => {
            switch (action.type) {
              case HISTORY_ACTIONS.UNDO: {
                return history.undo(draft);
              }
              case HISTORY_ACTIONS.REDO: {
                return history.redo(draft);
              }

              // TODO: Simplify History API
              case HISTORY_ACTIONS.IGNORE:
              case HISTORY_ACTIONS.THROTTLE: {
                const [type, ...params] = action.payload;
                methods(draft, query)[type](...params);
                break;
              }
              default:
                methods(draft, query)[action.type](...action.payload);
            }
          }
        );

        finalState = nextState;

        if (patchListener) {
          patchListener(
            nextState,
            state,
            { type: action.type, params: action.payload, patches },
            query,
            (cb) => {
              let normalizedDraft = produceWithPatches(nextState, cb);
              finalState = normalizedDraft[0];

              patches = [...patches, ...normalizedDraft[1]];
              inversePatches = [...normalizedDraft[2], ...inversePatches];
            }
          );
        }

        if (
          [HISTORY_ACTIONS.UNDO, HISTORY_ACTIONS.REDO].includes(
            action.type
          ) &&
          normalizeHistory
        ) {
          finalState = produce(finalState, normalizeHistory);
        }

        if (
          ![
            ...ignoreHistoryForActions,
            HISTORY_ACTIONS.UNDO,
            HISTORY_ACTIONS.REDO,
            HISTORY_ACTIONS.IGNORE,
          ].includes(action.type)
        ) {
          if (action.type === HISTORY_ACTIONS.THROTTLE) {
            history.throttleAdd(
              patches,
              inversePatches,
              action.config && action.config.rate
            );
          } else {
            history.add(patches, inversePatches);
          }
        }

        return finalState;
      },
      methods,
    ];
  }, [history, methods, queryMethods]);

  const [state, dispatch] = useReducer(reducer, initialState);

  // Create ref for state, so we can use it inside memoized functions without having to add it as a dependency
  const currState = useRef();
  currState.current = state;

  const query = useMemo(
    () =>
      !queryMethods
        ? []
        : createQuery(queryMethods, () => currState.current, history),
    [history, queryMethods]
  );

  const actions = useMemo(() => {
    const actionTypes = Object.keys(methodsFactory(null, null));

    const { current: ignoreHistoryForActions } = ignoreHistoryForActionsRef;

    return {
      ...actionTypes.reduce((accum, type) => {
        accum[type] = (...payload) => dispatch({ type, payload });
        return accum;
      }, {}),
      history: {
        undo() {
          return dispatch({
            type: HISTORY_ACTIONS.UNDO,
          });
        },
        redo() {
          return dispatch({
            type: HISTORY_ACTIONS.REDO,
          });
        },
        throttle: (rate) => {
          return {
            ...actionTypes
              .filter((type) => !ignoreHistoryForActions.includes(type))
              .reduce((accum, type) => {
                accum[type] = (...payload) =>
                  dispatch({
                    type: HISTORY_ACTIONS.THROTTLE,
                    payload: [type, ...payload],
                    config: {
                      rate: rate,
                    },
                  });
                return accum;
              }, {}),
          };
        },
        ignore: () => {
          return {
            ...actionTypes
              .filter((type) => !ignoreHistoryForActions.includes(type))
              .reduce((accum, type) => {
                accum[type] = (...payload) =>
                  dispatch({
                    type: HISTORY_ACTIONS.IGNORE,
                    payload: [type, ...payload],
                  });
                return accum;
              }, {}),
          };
        },
      },
    };
  }, [methodsFactory]);

  const getState = useCallback(() => currState.current, []);
  const watcher = useMemo(() => new Watcher(getState), [getState]);

  useEffect(() => {
    currState.current = state;
    watcher.notify();
  }, [state, watcher]);

  return useMemo(
    () => ({
      getState,
      subscribe: (collector, cb, collectOnCreate) =>
        watcher.subscribe(collector, cb, collectOnCreate),
      actions,
      query,
      history,
    }),
    [actions, query, watcher, getState, history]
  );
}

export function createQuery(
  queryMethods,
  getState,
  history
) {
  const queries = Object.keys(queryMethods()).reduce((accum, key) => {
    return {
      ...accum,
      [key]: (...args) => {
        return queryMethods(getState())[key](...args);
      },
    };
  }, {});

  return {
    ...queries,
    history: {
      canUndo: () => history.canUndo(),
      canRedo: () => history.canRedo(),
    },
  };
}

class Watcher {
  getState;
  subscribers = [];

  constructor(getState) {
    this.getState = getState;
  }

  /**
   * Creates a Subscriber
   * @returns {() => void} a Function that removes the Subscriber
   */
  subscribe = (
    collector,
    onChange,
    collectOnCreate
  ) => {
    const subscriber = new Subscriber(
      () => collector(this.getState()),
      onChange,
      collectOnCreate
    );
    this.subscribers.push(subscriber);
    return this.unsubscribe.bind(this, subscriber);
  }

  unsubscribe = (subscriber) => {
    if (this.subscribers.length) {
      const index = this.subscribers.indexOf(subscriber);
      if (index > -1) return this.subscribers.splice(index, 1);
    }
  }

  notify = () => {
    this.subscribers.forEach((subscriber) => subscriber.collect());
  }
}

class Subscriber {
  collected;
  collector;
  onChange;
  id;

  /**
   * Creates a Subscriber
   * @param collector The method that returns an object of values to be collected
   * @param onChange A callback method that is triggered when the collected values has changed
   * @param collectOnCreate If set to true, the collector/onChange will be called on instantiation
   */
  constructor(collector, onChange, collectOnCreate = false) {
    this.collector = collector;
    this.onChange = onChange;

    // Collect and run onChange callback when Subscriber is created
    if (collectOnCreate) this.collect();
  }

  collect = () => {
    try {
      const recollect = this.collector();
      if (!isEqualWith(recollect, this.collected)) {
        this.collected = recollect;
        if (this.onChange) this.onChange(this.collected);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(err);
    }
  }
}
