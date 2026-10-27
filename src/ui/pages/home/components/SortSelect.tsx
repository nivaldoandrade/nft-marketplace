import { NftSort } from '@/app/types/Nft';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { useCatalogSearch } from '@/ui/pages/home/useCatalogSearch';
import { cn } from '@/ui/utils/cn';
import { sortLabels } from '@/ui/utils/labels';

type SortSelectProps = {
  id: string;
  className?: string;
};

export function SortSelect({ id, className }: SortSelectProps) {
  const { search, setFilters } = useCatalogSearch();

  return (
    <div className={cn('flex items-center gap-1 text-[15px]', className)}>
      <label htmlFor={id} className="shrink-0">
        Ordenar por:
      </label>
      <Select value={search.sort} onValueChange={(sort) => setFilters({ sort: sort as NftSort })}>
        <SelectTrigger
          id={id}
          className="h-auto gap-2 border-none bg-transparent p-0 text-[15px] shadow-none data-[size=default]:h-auto dark:bg-transparent [&_svg]:opacity-100"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" className="border-border bg-card font-sans">
          {Object.values(NftSort).map((sort) => (
            <SelectItem key={sort} value={sort}>
              {sortLabels[sort]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
