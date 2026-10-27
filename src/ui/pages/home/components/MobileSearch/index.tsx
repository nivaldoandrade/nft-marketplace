import { CloseIcon, FilterIcon, SearchOutlineIcon } from '@/ui/components/Icons';
import { FiltersSheet } from '@/ui/pages/home/components/FiltersSheet';
import { useMobileSearch } from '@/ui/pages/home/components/MobileSearch/useMobileSearch';
import { SEARCH_INPUT_ID } from '@/ui/utils/sections';

export function MobileSearch() {
  const { inputRef, term, setTerm, handleSubmit, handleClear } = useMobileSearch();

  return (
    <div className="flex gap-2 md:hidden">
      <form
        role="search"
        onSubmit={handleSubmit}
        className="flex h-[45px] min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-card px-3"
      >
        <SearchOutlineIcon className="size-[22px] shrink-0 text-subtle" />
        <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
          Buscar NFTs ou coleções
        </label>
        <input
          ref={inputRef}
          id={SEARCH_INPUT_ID}
          type="search"
          enterKeyHint="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Explorar coleções"
          className="h-full min-w-0 flex-1 bg-transparent text-base font-bold placeholder:text-subtle focus-visible:outline-none"
        />
        {term && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpar busca"
            className="-mr-1.5 flex size-9 shrink-0 items-center justify-center text-subtle hover:text-accent"
          >
            <CloseIcon className="size-3" />
          </button>
        )}
      </form>
      <FiltersSheet>
        <button
          type="button"
          aria-label="Abrir filtros"
          className="flex size-[45px] shrink-0 items-center justify-center rounded-[14px] bg-linear-to-br from-primary/45 to-primary text-primary-foreground pressable"
        >
          <FilterIcon className="size-[22px]" />
        </button>
      </FiltersSheet>
    </div>
  );
}
