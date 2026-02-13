import { useWedding } from '../../state/WeddingContext';
import type { TableShape, TableOrientation } from '../../types';
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
              <div className="table-config__control">
                <div className="table-config__toggle-group">
                  <button
                    className={`table-config__toggle-btn${table.shape === 'round' ? ' table-config__toggle-btn--active' : ''}`}
                    title="Round"
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_TABLE',
                        tableId: table.id,
                        changes: { shape: 'round' as TableShape },
                      })
                    }
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                  <button
                    className={`table-config__toggle-btn${table.shape === 'rectangle' ? ' table-config__toggle-btn--active' : ''}`}
                    title="Rectangle"
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_TABLE',
                        tableId: table.id,
                        changes: { shape: 'rectangle' as TableShape },
                      })
                    }
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <rect x="2" y="3.5" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                </div>
              </div>
              {table.shape === 'rectangle' && (
                <div className="table-config__control">
                  <div className="table-config__toggle-group">
                    <button
                      className={`table-config__toggle-btn${(table.orientation ?? 'vertical') === 'vertical' ? ' table-config__toggle-btn--active' : ''}`}
                      title="Vertical"
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_TABLE',
                          tableId: table.id,
                          changes: { orientation: 'vertical' as TableOrientation },
                        })
                      }
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <rect x="4.5" y="1.5" width="7" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                    <button
                      className={`table-config__toggle-btn${(table.orientation ?? 'vertical') === 'horizontal' ? ' table-config__toggle-btn--active' : ''}`}
                      title="Horizontal"
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_TABLE',
                          tableId: table.id,
                          changes: { orientation: 'horizontal' as TableOrientation },
                        })
                      }
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <rect x="1.5" y="4.5" width="13" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <label className="table-config__control">
                <span>Seats</span>
                <input
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
