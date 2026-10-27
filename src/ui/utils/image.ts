export function getImageSrcSet(image: string) {
  return `${image} 400w, ${image.replace('-400.', '-800.')} 800w`;
}

export function getLargeImage(image: string) {
  return image.replace('-400.', '-800.');
}
