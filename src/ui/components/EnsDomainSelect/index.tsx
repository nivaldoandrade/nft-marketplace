import {
  fieldSelectContentClassName,
  fieldSelectTriggerClassName,
} from '@/ui/components/FormField/styles';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { cn } from '@/ui/utils/cn';

// .eth is the only domain offered, but the control keeps the selector shown in the Figma
export function EnsDomainSelect() {
  return (
    <Select defaultValue="eth">
      <SelectTrigger
        aria-label="Domínio ENS"
        className={cn(
          fieldSelectTriggerClassName,
          'w-[78px] shrink-0 gap-1.5 pr-[5px] pl-2.5 text-[15px] [&_svg]:size-5',
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" className={fieldSelectContentClassName}>
        <SelectItem value="eth" hideIndicator>
          .eth
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
