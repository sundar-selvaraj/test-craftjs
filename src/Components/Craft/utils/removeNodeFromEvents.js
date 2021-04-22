
export const removeNodeFromEvents = (state, nodeId) =>
  Object.keys(state.events).forEach((key) => {
    if (state.events[key] && state.events[key] === nodeId) {
      state.events[key] = null;
    }
  });
