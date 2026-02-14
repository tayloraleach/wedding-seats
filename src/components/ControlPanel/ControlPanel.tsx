import { GuestManager } from './GuestManager';
import { TableConfigurator } from './TableConfigurator';
import { Separator } from '@/components/ui/separator';

export function ControlPanel() {
  return (
    <aside className="w-[320px] min-w-[320px] no-scrollbar p-5 bg-sidebar border-r border-sidebar-border overflow-y-auto overflow-x-hidden h-full">
      <GuestManager />
      <Separator className="my-5" />
      <TableConfigurator />
    </aside>
  );
}
