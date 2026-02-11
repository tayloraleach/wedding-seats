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
 * Distributes seats along only the two long (left & right) edges of a vertical rectangle.
 * The rectangle is taller than wide, so the long edges are left and right.
 */
export function getRectangleSeatPositions(
  total: number,
  width: number,
  height: number
): Point[] {
  if (total === 0) return [];

  const positions: Point[] = [];

  // Split evenly between left and right edges
  const leftCount = Math.ceil(total / 2);
  const rightCount = total - leftCount;

  // Left edge: top to bottom
  for (let i = 0; i < leftCount; i++) {
    positions.push({
      x: 0,
      y: ((i + 1) / (leftCount + 1)) * height,
    });
  }

  // Right edge: top to bottom
  for (let i = 0; i < rightCount; i++) {
    positions.push({
      x: width,
      y: ((i + 1) / (rightCount + 1)) * height,
    });
  }

  return positions;
}
