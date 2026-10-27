import type { EditionType, NftEdition } from '@/app/types/Nft';
import { cn } from '@/ui/utils/cn';
import { editionLabels } from '@/ui/utils/labels';

const widthByEdition: Record<EditionType, string> = {
  '1/1': 'w-9',
  '1/10': 'w-[42px]',
  '1/50': 'w-[42px]',
  open: 'w-[66px]',
};

type EditionOptionProps = {
  name: string;
  edition: NftEdition;
  isSelected: boolean;
  onSelect: (type: EditionType) => void;
};

export function EditionOption({ name, edition, isSelected, onSelect }: EditionOptionProps) {
  const isSoldOut = edition.available === 0;

  return (
    <label
      className={cn(
        'flex h-7 cursor-pointer items-center justify-center rounded-[50%] border border-border text-sm leading-4 text-muted-foreground transition-colors select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
        widthByEdition[edition.type],
        isSelected && 'border-primary font-medium text-accent',
        !isSoldOut && !isSelected && 'hover:border-primary/60',
        isSoldOut && 'cursor-not-allowed line-through opacity-50',
      )}
    >
      <input
        type="radio"
        name={name}
        value={edition.type}
        checked={isSelected}
        disabled={isSoldOut}
        onChange={() => onSelect(edition.type)}
        className="sr-only"
      />
      {editionLabels[edition.type]}
      {isSoldOut && <span className="sr-only"> (esgotada)</span>}
    </label>
  );
}
