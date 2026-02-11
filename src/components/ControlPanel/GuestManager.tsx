import { useState, useRef } from 'react';
import { useWedding } from '../../state/WeddingContext';
import './GuestManager.css';

export function GuestManager() {
  const { state, dispatch } = useWedding();
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'ADD_GUEST', name: trimmed });
    setName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const names = parsed.filter((item): item is string => typeof item === 'string');
          if (names.length > 0) {
            dispatch({ type: 'IMPORT_GUESTS', names });
          }
        }
      } catch {
        alert('Invalid JSON file. Expected an array of name strings.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="guest-manager">
      <h3>Guests ({state.guests.length})</h3>
      <div className="guest-manager__input-row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Guest name"
          className="guest-manager__input"
        />
        <button onClick={handleAdd} className="guest-manager__add-btn">
          Add
        </button>
      </div>
      <div className="guest-manager__import-row">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="guest-manager__file-input"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="guest-manager__import-btn"
        >
          Import JSON
        </button>
      </div>
      <ul className="guest-manager__list">
        {state.guests.map((guest) => (
          <li key={guest.id} className="guest-manager__item">
            <span>{guest.name}</span>
            <button
              onClick={() => dispatch({ type: 'REMOVE_GUEST', guestId: guest.id })}
              className="guest-manager__remove-btn"
              title="Remove guest"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
