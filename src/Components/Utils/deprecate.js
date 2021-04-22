
export const deprecationWarning = (name, payload) => {
  let message = `Deprecation warning: ${name} will be deprecated in future relases.`;

  const { suggest, doc } = payload;

  if (suggest) {
    message += ` Please use ${suggest} instead.`;
  }

  // URL link to Documentation
  if (doc) {
    message += `(${doc})`;
  }

  // eslint-disable-next-line no-console
  console.warn(message);
};
