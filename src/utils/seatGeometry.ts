export interface Point {
  x: number;
  y: number;
}

export function getRoundSeatPositions(
  total: number,
  radius: number,
  center: Point
): Point[] {
  const positions: Point[] = [];
  for (let i = 0; i < total; i++) {
    const angle = (2 * Math.PI * i) / total - Math.PI / 2; // start from top
    positions.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }
  return positions;
}

/**
 * Distributes seats along the two long edges of a rectangle.
 * Vertical: seats on left (x=0) and right (x=width) edges.
 * Horizontal: seats on top (y=0) and bottom (y=height) edges.
 */
export function getRectangleSeatPositions(
  total: number,
  width: number,
  height: number,
  orientation: 'vertical' | 'horizontal' = 'vertical'
): Point[] {
  if (total === 0) return [];

  const positions: Point[] = [];
  const firstCount = Math.ceil(total / 2);
  const secondCount = total - firstCount;

  if (orientation === 'vertical') {
    // Left edge: top to bottom
    for (let i = 0; i < firstCount; i++) {
      positions.push({ x: 0, y: ((i + 1) / (firstCount + 1)) * height });
    }
    // Right edge: top to bottom
    for (let i = 0; i < secondCount; i++) {
      positions.push({ x: width, y: ((i + 1) / (secondCount + 1)) * height });
    }
  } else {
    // Top edge: left to right
    for (let i = 0; i < firstCount; i++) {
      positions.push({ x: ((i + 1) / (firstCount + 1)) * width, y: 0 });
    }
    // Bottom edge: left to right
    for (let i = 0; i < secondCount; i++) {
      positions.push({ x: ((i + 1) / (secondCount + 1)) * width, y: height });
    }
  }

  return positions;
}
