import { cn } from '@/ui/utils/cn';

type FacetOptionProps<T extends string> = {
  option: { id: T; label: string; count: number };
  isSelected: boolean;
  emphasizeCount: boolean;
  onToggle: (id: T) => void;
};

export function FacetOption<T extends string>({
  option,
  isSelected,
  emphasizeCount,
  onToggle,
}: FacetOptionProps<T>) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={() => onToggle(option.id)}
        className={cn(
          'flex h-10 w-full items-center justify-between text-[15px] text-muted-foreground transition-colors hover:text-accent',
          isSelected && 'text-accent',
        )}
      >
        <span className={cn(isSelected && 'underline underline-offset-4')}>{option.label}</span>
        <span className={cn(emphasizeCount && 'font-bold')}>({option.count})</span>
      </button>
    </li>
  );
}
