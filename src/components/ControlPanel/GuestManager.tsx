import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useWedding } from '../../state/WeddingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div>
      <h3 className="text-sm font-semibold mb-3">Guests ({state.guests.length})</h3>
      <div className="flex gap-2 mb-3">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Guest name"
          className="flex-1"
        />
        <Button onClick={handleAdd} size="sm">
          Add
        </Button>
      </div>
      <div className="mb-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          Import Guests (JSON)
        </Button>
      </div>
      <ul className="list-none p-0 m-0 max-h-[200px] overflow-y-auto">
        {state.guests.map((guest) => (
          <li key={guest.id} className="flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-secondary">
            <span>{guest.name}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => dispatch({ type: 'REMOVE_GUEST', guestId: guest.id })}
              title="Remove guest"
              className="text-muted-foreground hover:text-destructive"
            >
              <X />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
