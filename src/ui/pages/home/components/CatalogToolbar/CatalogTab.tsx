import { cn } from '@/ui/utils/cn';

type CatalogTabProps = {
  label: string;
  isActive: boolean;
  isFirst: boolean;
  onSelect: () => void;
};

export function CatalogTab({ label, isActive, isFirst, onSelect }: CatalogTabProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      className={cn(
        'relative shrink-0 pb-1 text-sm leading-4 text-foreground transition-colors hover:text-accent md:pb-1.5 md:text-[15px] md:font-medium',
        isFirst && 'max-md:-mr-3',
        isActive &&
          'font-bold text-accent after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary md:font-medium md:after:w-[86%]',
      )}
    >
      {label}
    </button>
  );
}
