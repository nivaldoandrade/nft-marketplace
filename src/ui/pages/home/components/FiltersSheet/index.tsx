import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/components/ui/sheet';
import { CatalogFilters } from '@/ui/pages/home/components/CatalogFilters';
import { SortSelect } from '@/ui/pages/home/components/SortSelect';
import { useCatalog } from '@/ui/pages/home/useCatalog';

type FiltersSheetProps = {
  children: React.ReactNode;
};

export function FiltersSheet({ children }: FiltersSheetProps) {
  const { total, isPending } = useCatalog();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto border-border bg-background font-sans sm:max-w-sm"
      >
        <SheetHeader className="p-5 pb-2">
          <SheetTitle className="text-lg font-bold">Filtros</SheetTitle>
          <SheetDescription>Combine coleções, faixa de preço e rede.</SheetDescription>
        </SheetHeader>
        <SortSelect id="sheet-sort" className="px-5 py-3" />
        <CatalogFilters className="bg-transparent" />
        <div className="sticky bottom-0 mt-auto bg-background p-5">
          <SheetClose className="h-11 w-full rounded-md bg-primary font-bold text-primary-foreground pressable hover:bg-accent">
            {isPending ? 'Ver resultados' : `Ver ${total} resultados`}
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
