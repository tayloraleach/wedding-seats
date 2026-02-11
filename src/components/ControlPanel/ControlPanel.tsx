import { GuestManager } from './GuestManager';
import { TableConfigurator } from './TableConfigurator';
import './ControlPanel.css';

export function ControlPanel() {
  return (
    <aside className="control-panel">
      <GuestManager />
      <hr className="control-panel__divider" />
      <TableConfigurator />
    </aside>
  );
}
