import { GuestManager } from './GuestManager';
import { TableConfigurator } from './TableConfigurator';
import { Separator } from '@/components/ui/separator';

export function ControlPanel() {
  return (
    <aside className="w-[320px] min-w-[320px] p-5 bg-background border-r overflow-y-auto overflow-x-hidden h-full">
      <GuestManager />
      <Separator className="my-5" />
      <TableConfigurator />
    </aside>
  );
}
