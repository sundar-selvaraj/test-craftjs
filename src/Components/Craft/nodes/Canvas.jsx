import React, { useEffect } from 'react';

import { Element } from './Element';
import { deprecationWarning } from '../../Utils';

export const deprecateCanvasComponent = () =>
  deprecationWarning('<Canvas />', {
    suggest: '<Element canvas={true} />',
  });

export function Canvas({ ...props }) {
  useEffect(() => deprecateCanvasComponent(), []);

  return <Element {...props} canvas={true} />;
}
