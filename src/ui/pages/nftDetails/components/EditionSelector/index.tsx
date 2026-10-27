import type { EditionType, NftEdition } from '@/app/types/Nft';
import { EditionOption } from '@/ui/pages/nftDetails/components/EditionSelector/EditionOption';
import { cn } from '@/ui/utils/cn';

type EditionSelectorProps = {
  name: string;
  editions: NftEdition[];
  selected: EditionType | undefined;
  onSelect: (type: EditionType) => void;
  className?: string;
};

export function EditionSelector({
  name,
  editions,
  selected,
  onSelect,
  className,
}: EditionSelectorProps) {
  return (
    <fieldset className={cn('flex flex-col gap-2 md:gap-3', className)}>
      <legend className="mb-2 text-[15px] leading-4 font-bold md:mb-3">Edição:</legend>
      <div className="flex flex-wrap gap-3 md:gap-1.5">
        {editions.map((edition) => (
          <EditionOption
            key={edition.type}
            name={name}
            edition={edition}
            isSelected={edition.type === selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    </fieldset>
  );
}
