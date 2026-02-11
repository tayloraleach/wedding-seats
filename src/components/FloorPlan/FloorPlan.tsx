import { useWedding } from '../../state/WeddingContext';
import { TableView } from '../Table/TableView';
import './FloorPlan.css';

export function FloorPlan() {
  const { state } = useWedding();

  return (
    <div className="floor-plan">
      {state.tables.length === 0 ? (
        <div className="floor-plan__empty">
          <p>No tables yet. Add tables using the panel on the left.</p>
        </div>
      ) : (
        <div className="floor-plan__canvas">
          {state.tables.map((table) => (
            <TableView key={table.id} table={table} />
          ))}
        </div>
      )}
    </div>
  );
}
