import React from 'react';

export function mapChildrenToNodes(
  children,
  cb
) {
  return React.Children.toArray(children).reduce(
    (result, child) => {
      const node = cb(child);
      result.push(node);
      return result;
    },
    []
  );
}
