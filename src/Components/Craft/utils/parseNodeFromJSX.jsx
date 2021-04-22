import React, { Fragment } from 'react';

import { createNode } from './createNode';


export function parseNodeFromJSX(
  jsx,
  normalize
) {
  let element = jsx;
  console.log('node-----jsx', element);

  if (typeof element === 'string') {
    element = React.createElement(Fragment, {}, element);
  }

  let actualType = element.type;

  console.log('node-----actualType', actualType);

  return createNode(
    {
      data: {
        type: actualType,
        props: { ...element.props },
      },
    },
    (node) => {
      if (normalize) {
        normalize(node, element);
      }
    }
  );
}
