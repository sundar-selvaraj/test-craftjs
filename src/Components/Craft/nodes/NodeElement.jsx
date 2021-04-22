import React from 'react';

import { NodeProvider } from './NodeContext';

import { RenderNodeToElement } from '../render/RenderNode';

export const NodeElement = React.memo(({ id }) => {
  return (
    <NodeProvider id={id}>
      <RenderNodeToElement />
    </NodeProvider>
  );
});
