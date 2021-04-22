import React, { useEffect } from 'react';
import invariant from 'tiny-invariant';

import { EditorContext } from './EditorContext';
import { useEditorStore } from './store';

import { Events } from '../events';
import { ERROR_RESOLVER_NOT_AN_OBJECT } from '../../Utils';

/**
 * A React Component that provides the Editor context
 */
export const Editor = ({
  children,
  ...options
}) => {
  // we do not want to warn the user if no resolver was supplied
  if (options.resolver !== undefined) {
    invariant(
      typeof options.resolver === 'object' && !Array.isArray(options.resolver),
      ERROR_RESOLVER_NOT_AN_OBJECT
    );
  }

  const context = useEditorStore(options);

  useEffect(() => {
    if (context && options)
      context.actions.setOptions((editorOptions) => {
        editorOptions = options;
      });
  }, [context, options]);

  useEffect(() => {
    context.subscribe(
      (_) => ({
        json: context.query.serialize(),
      }),
      () => {
        context.query.getOptions().onNodesChange(context.query);
      }
    );
  }, [context]);

  return context ? (
    <EditorContext.Provider value={context}>
      <Events>{children}</Events>
    </EditorContext.Provider>
  ) : null;
};
