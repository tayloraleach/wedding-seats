import { X } from 'lucide-react';
import { useWedding } from '../../state/WeddingContext';
import type { TableShape, TableOrientation } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function TableConfigurator() {
  const { state, dispatch } = useWedding();

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Tables ({state.tables.length})</h3>
      <Button
        variant="outline"
        className="w-full mb-3 border-dashed text-muted-foreground"
        onClick={() => dispatch({ type: 'ADD_TABLE' })}
      >
        + Add Table
      </Button>
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
        {state.tables.map((table) => (
          <Card key={table.id} className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Input
                type="text"
                value={table.label}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_TABLE',
                    tableId: table.id,
                    changes: { label: e.target.value },
                  })
                }
                className="flex-1 h-7 text-sm font-medium border-transparent bg-transparent focus:bg-secondary"
              />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => dispatch({ type: 'REMOVE_TABLE', tableId: table.id })}
                title="Remove table"
                className="text-muted-foreground hover:text-destructive"
              >
                <X />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleGroup
                type="single"
                value={table.shape}
                onValueChange={(value) => {
                  if (value) {
                    dispatch({
                      type: 'UPDATE_TABLE',
                      tableId: table.id,
                      changes: { shape: value as TableShape },
                    });
                  }
                }}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="round" aria-label="Round" className="px-2">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </ToggleGroupItem>
                <ToggleGroupItem value="rectangle" aria-label="Rectangle" className="px-2">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <rect x="2" y="3.5" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </ToggleGroupItem>
              </ToggleGroup>
              {table.shape === 'rectangle' && (
                <ToggleGroup
                  type="single"
                  value={table.orientation ?? 'vertical'}
                  onValueChange={(value) => {
                    if (value) {
                      dispatch({
                        type: 'UPDATE_TABLE',
                        tableId: table.id,
                        changes: { orientation: value as TableOrientation },
                      });
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <ToggleGroupItem value="vertical" aria-label="Vertical" className="px-2">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <rect x="4.5" y="1.5" width="7" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="horizontal" aria-label="Horizontal" className="px-2">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <rect x="1.5" y="4.5" width="13" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </ToggleGroupItem>
                </ToggleGroup>
              )}
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Seats</span>
                <Input
                  type="number"
                  value={table.seatCount}
                  min={1}
                  max={10}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_TABLE',
                      tableId: table.id,
                      changes: { seatCount: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) },
                    })
                  }
                  className="w-14 h-7 text-xs"
                />
              </label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
