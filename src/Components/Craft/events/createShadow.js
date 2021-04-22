export const createShadow = (e) => {
  const shadow = (e.target).cloneNode(true);
  const { width, height } = (e.target).getBoundingClientRect();
  shadow.style.width = `${width}px`;
  shadow.style.height = `${height}px`;
  shadow.style.position = 'fixed';
  shadow.style.left = '-100%';
  shadow.style.top = '-100%';

  document.body.appendChild(shadow);
  e.dataTransfer.setDragImage(shadow, 0, 0);

  return shadow;
};
