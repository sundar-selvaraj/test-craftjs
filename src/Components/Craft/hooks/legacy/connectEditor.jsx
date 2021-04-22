import React from 'react';

import { useEditor } from '../useEditor';

export function connectEditor(collect) {
  return (WrappedComponent) => {
    return (props) => {
      const Editor = collect ? useEditor(collect) : useEditor();
      return <WrappedComponent {...Editor} {...props} />;
    };
  };
}
