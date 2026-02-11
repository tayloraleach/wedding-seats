import { useWedding } from '../../state/WeddingContext';
import type { TableShape } from '../../types';
import './TableConfigurator.css';

export function TableConfigurator() {
  const { state, dispatch } = useWedding();

  return (
    <div className="table-config">
      <h3>Tables ({state.tables.length})</h3>
      <button
        onClick={() => dispatch({ type: 'ADD_TABLE' })}
        className="table-config__add-btn"
      >
        + Add Table
      </button>
      <div className="table-config__list">
        {state.tables.map((table) => (
          <div key={table.id} className="table-config__item">
            <div className="table-config__item-header">
              <input
                type="text"
                value={table.label}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_TABLE',
                    tableId: table.id,
                    changes: { label: e.target.value },
                  })
                }
                className="table-config__label-input"
              />
              <button
                onClick={() => dispatch({ type: 'REMOVE_TABLE', tableId: table.id })}
                className="table-config__remove-btn"
                title="Remove table"
              >
                &times;
              </button>
            </div>
            <div className="table-config__controls">
              <label className="table-config__control">
                <span>Shape</span>
                <select
                  value={table.shape}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_TABLE',
                      tableId: table.id,
                      changes: { shape: e.target.value as TableShape },
                    })
                  }
                  className="table-config__select"
                >
                  <option value="round">Round</option>
                  <option value="rectangle">Rectangle</option>
                </select>
              </label>
              <label className="table-config__control">
                <span>Seats</span>
                <input
                  type="number"
                  value={table.seatCount}
                  min={1}
                  max={20}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_TABLE',
                      tableId: table.id,
                      changes: { seatCount: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) },
                    })
                  }
                  className="table-config__number-input"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
