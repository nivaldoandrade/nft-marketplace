import { Skeleton } from '@/ui/components/ui/skeleton';
import { FacetOption } from '@/ui/pages/home/components/CatalogFilters/FacetOption';
import { cn } from '@/ui/utils/cn';

type FacetListProps<T extends string> = {
  title: string;
  options: { id: T; label: string; count: number }[];
  selected: T[];
  isLoading: boolean;
  emphasizeCount?: boolean;
  flushRight?: boolean;
  onToggle: (id: T) => void;
};

export function FacetList<T extends string>({
  title,
  options,
  selected,
  isLoading,
  emphasizeCount = false,
  flushRight = false,
  onToggle,
}: FacetListProps<T>) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-lg leading-4 font-bold">{title}</legend>
      <ul className={cn('flex flex-col pl-3', !flushRight && 'pr-3')}>
        {isLoading
          ? Array.from({ length: options.length || 3 }, (_, index) => (
              <li key={index} className="flex h-10 items-center">
                <Skeleton className="h-4 w-full" />
              </li>
            ))
          : options.map((option) => (
              <FacetOption
                key={option.id}
                option={option}
                isSelected={selected.includes(option.id)}
                emphasizeCount={emphasizeCount}
                onToggle={onToggle}
              />
            ))}
      </ul>
    </fieldset>
  );
}
