import { useState, useCallback, useRef, useEffect } from 'react';

// import {
//   CallbacksFor,
//   MethodsOrOptions,
//   StateFor,
//   QueryCallbacksFor,
//   QueryMethods,
//   SubscriberAndCallbacksFor,
// } from './useMethods';

// export function useCollector(store);

// export function useCollector(
//   store,
//   collector
// );

export function useCollector(store, collector) {
  console.log('-------------------store', store);
  const { subscribe, getState = () => {}, actions, query } = store;

  const initial = useRef(true);
  const collected = useRef(null);
  const collectorRef = useRef(collector);
  collectorRef.current = collector;

  const onCollect = useCallback(
    (collected) => {
      return { ...collected, actions, query };
    },
    [actions, query]
  );

  // Collect states for initial render
  if (initial.current && collector) {
    console.log('initial-------------', collector);
    collected.current = collector(getState(), query);
    initial.current = false;
  }

  const [renderCollected, setRenderCollected] = useState(
    onCollect(collected.current)
  );

  // Collect states on state change
  useEffect(() => {
    let unsubscribe;
    if (collectorRef.current) {
      unsubscribe = subscribe(
        (current) => collectorRef.current(current, query),
        (collected) => {
          setRenderCollected(onCollect(collected));
        }
      );
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [onCollect, query, subscribe]);

  return renderCollected;
}
