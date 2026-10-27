import type { NftsService } from '@/app/services/NftsService';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { Slider } from '@/ui/components/ui/slider';
import { usePriceRange } from '@/ui/pages/home/components/CatalogFilters/usePriceRange';
import { formatPriceRange } from '@/ui/utils/formatPrice';

type PriceRangeFilterProps = {
  range: NftsService.ListResponse['facets']['priceRange'] | undefined;
};

export function PriceRangeFilter({ range }: PriceRangeFilterProps) {
  const { bounds, value, setValue, handleApply } = usePriceRange(range);

  return (
    <fieldset className="flex flex-col">
      <legend className="mb-3 text-lg leading-4 font-bold">Faixa de preço</legend>
      <div className="flex flex-col gap-3 pl-3">
        {range ? (
          <Slider
            min={bounds[0]}
            max={bounds[1]}
            step={0.01}
            minStepsBetweenThumbs={1}
            value={value}
            onValueChange={(next) => setValue([next[0], next[1]])}
            thumbLabels={['Preço mínimo', 'Preço máximo']}
            className="h-[21px]"
          />
        ) : (
          <Skeleton className="h-[21px] w-full" />
        )}
        <p className="text-[15px] leading-5">Preço: {formatPriceRange(value[0], value[1])}</p>
        <button
          type="button"
          onClick={handleApply}
          disabled={!range}
          className="h-9 w-fit rounded-md bg-primary px-3 font-bold text-primary-foreground pressable disabled:opacity-50"
        >
          Aplicar
        </button>
      </div>
    </fieldset>
  );
}
