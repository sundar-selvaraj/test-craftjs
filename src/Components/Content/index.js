import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Editor, Frame, Element, useNode, useEditor } from '../Craft';
import Container from './Container';
import { testHtml } from './test';
 

export const TextComponent = ({ text }) => {
  const { connectors: { drag } } = useNode();

  return (
    <div ref={drag}>
      <h2>{text}</h2>
    </div>
  )
}

// const RenderNode = ({ render }) => {
//   const { actions, query, connectors } = useEditor();
//   const {
//     id,
//     isActive,
//     isHover,
//     dom,
//     name,
//     moveable,
//     deletable,
//     connectors: { drag },
//     parent,
//   } = useNode((node) => ({
//     isActive: node.events.selected,
//     isHover: node.events.hovered,
//     dom: node.dom,
//     name: node.data.custom.displayName || node.data.displayName,
//     moveable: query.node(node.id).isDraggable(),
//     deletable: query.node(node.id).isDeletable(),
//     parent: node.data.parent,
//     props: node.data.props,
//   }));

//   const currentRef = useRef();

//   useEffect(() => {
//     if (dom) {
//       if (isActive || isHover) dom.classList.add('component-selected');
//       else dom.classList.remove('component-selected');
//     }
//   }, [dom, isActive, isHover]);

//   const getPos = useCallback((dom) => {
//     const { top, left, bottom } = dom
//       ? dom.getBoundingClientRect()
//       : { top: 0, left: 0, bottom: 0 };
//     return {
//       top: `${top > 0 ? top : bottom}px`,
//       left: `${left}px`,
//     };
//   }, []);

//   const scroll = useCallback(() => {
//     const { current: currentDOM } = currentRef;

//     if (!currentDOM) return;
//     const { top, left } = getPos(dom);
//     currentDOM.style.top = top;
//     currentDOM.style.left = left;
//   }, [dom]);

//   useEffect(() => {
//     document
//       .querySelector('.craftjs-renderer')
//       .addEventListener('scroll', scroll);

//     return () => {
//       document
//         .querySelector('.craftjs-renderer')
//         .removeEventListener('scroll', scroll);
//     };
//   }, [scroll]);

//   return (
//     <>
//       {render}
//     </>
//   );
// };


const Content = () => {
  const [contentHtml, setContent] = useState(testHtml);
  return (
    <div className="content-wrapper">
      Content
      <div style={{ display: 'flex' }} className="craftjs-renderer">
        <Frame>
          <Element
            is={Container}
            canvas
            width="800px"
            background={{ r: 255, g: 255, b: 255, a: 1 }}
            margin={[30, 10, 30, 10]}
            contentHtml={contentHtml}
          >
          </Element>
        </Frame>
      </div>
    </div>
  )
}

export default Content;
