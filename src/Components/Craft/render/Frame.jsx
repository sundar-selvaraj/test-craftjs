import React, { useEffect, useState, useRef } from 'react';

import { useInternalEditor } from '../editor/useInternalEditor';
import { NodeElement } from '../nodes/NodeElement';
import { deprecationWarning, ROOT_NODE } from '../../Utils';

/**
 * A React Component that defines the editable area
 */
export const Frame = ({ children, json, data }) => {
  const { actions, query } = useInternalEditor();

  const [render, setRender] = useState(null);

  if (!!json) {
    deprecationWarning('<Frame json={...} />', {
      suggest: '<Frame data={...} />',
    });
  }

  const initialState = useRef({
    initialChildren: children,
    initialData: data || json,
  });

  useEffect(() => {
    const { initialChildren, initialData } = initialState.current;

    if (initialData) {
      actions.history.ignore().deserialize(initialData);
    } else if (initialChildren) {
      const rootNode = React.Children.only(
        initialChildren
      );

      const node = query.parseReactElement(rootNode).toNodeTree((node, jsx) => {
        if (jsx === rootNode) {
          node.id = ROOT_NODE;
        }
        return node;
      });

      actions.history.ignore().addNodeTree(node);
    }

    setRender(<NodeElement id={ROOT_NODE} />);
  }, [actions, query]);

  return render;
};
