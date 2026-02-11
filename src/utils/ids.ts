let counter = 0;

export function generateId(): string {
  return `${Date.now()}-${counter++}-${Math.random().toString(36).slice(2, 7)}`;
}

export function seatKey(tableId: string, seatIndex: number): string {
  return `${tableId}:${seatIndex}`;
}

export function parseSeatKey(key: string): { tableId: string; seatIndex: number } {
  const lastColon = key.lastIndexOf(':');
  return {
    tableId: key.slice(0, lastColon),
    seatIndex: parseInt(key.slice(lastColon + 1), 10),
  };
}
