import { useEffect, useRef, useState } from 'react';

import { useCatalogSearch } from '@/ui/pages/home/useCatalogSearch';
import { scrollToCatalog } from '@/ui/utils/sections';

const DEBOUNCE_MS = 400;

export function useMobileSearch() {
  const { search, setFilters } = useCatalogSearch();
  const [term, setTerm] = useState(search.q ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const [previousQuery, setPreviousQuery] = useState(search.q);

  if (previousQuery !== search.q) {
    setPreviousQuery(search.q);
    setTerm(search.q ?? '');
  }

  useEffect(() => {
    const value = term.trim() || undefined;

    if (value === search.q) {
      return;
    }

    const timeout = setTimeout(() => setFilters({ q: value }), DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [search.q, setFilters, term]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = term.trim() || undefined;

    if (value !== search.q) {
      setFilters({ q: value });
    }

    event.currentTarget.querySelector('input')?.blur();
    scrollToCatalog();
  }

  function handleClear() {
    setTerm('');

    if (search.q) {
      setFilters({ q: undefined });
    }

    inputRef.current?.focus();
  }

  return {
    inputRef,
    term,
    setTerm,
    handleSubmit,
    handleClear,
  };
}
