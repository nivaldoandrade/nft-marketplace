import { useNavigate, useRouterState, useSearch } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/app/contexts/AuthContext/useAuth';
import { useAuthModal } from '@/ui/hooks/useAuthModal';
import { useIsSectionActive } from '@/ui/hooks/useIsSectionActive';
import { getFirstName, getInitials } from '@/ui/utils/initials';
import { CATALOG_SECTION_ID, scrollToCatalog } from '@/ui/utils/sections';

const MARKET_PATHS = ['/nft', '/carrinho', '/pagamento'];

export function useHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  const navigate = useNavigate();
  const { user, isSignedIn } = useAuth();
  const { open: openAuthModal } = useAuthModal();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const urlQuery = useSearch({ strict: false, select: (search) => search.q });

  const isHome = pathname === '/';
  const activeQuery = (isHome && urlQuery) || '';
  const isCatalogInView = useIsSectionActive(CATALOG_SECTION_ID, isHome);
  const isMarketPage = MARKET_PATHS.some((path) => pathname.startsWith(path));

  const isHomeActive = isHome && !isCatalogInView;
  const isMarketActive = isMarketPage || isCatalogInView;

  const [searchTerm, setSearchTerm] = useState(activeQuery);
  const [previousQuery, setPreviousQuery] = useState(activeQuery);

  if (previousQuery !== activeQuery) {
    setPreviousQuery(activeQuery);
    setSearchTerm(activeQuery);
  }

  const isSearchVisible = isSearchOpen || !!activeQuery;

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchVisible && shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      openButtonRef.current?.focus();
    }
  }, [isSearchVisible]);

  const handleOpenSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    if (!activeQuery) {
      setSearchTerm('');
      setIsSearchOpen(false);
    }
  }, [activeQuery]);

  const handleSearchBlur = useCallback(
    (event: React.FocusEvent<HTMLFormElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget) && !searchTerm.trim()) {
        handleCloseSearch();
      }
    },
    [handleCloseSearch, searchTerm],
  );

  const navigateWithQuery = useCallback(
    (q: string | undefined) => {
      if (!isHome) {
        return navigate({ to: '/', search: { q }, hash: CATALOG_SECTION_ID });
      }

      return navigate({
        to: '/',
        search: (previous) => ({ ...previous, q, page: 1 }),
        resetScroll: false,
      });
    },
    [isHome, navigate],
  );

  const handleSubmitSearch = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      await navigateWithQuery(searchTerm.trim() || undefined);

      if (isHome) {
        scrollToCatalog();
      }
    },
    [isHome, navigateWithQuery, searchTerm],
  );

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      shouldRestoreFocusRef.current = true;
      setSearchTerm('');
      setIsSearchOpen(false);

      if (activeQuery) {
        navigateWithQuery(undefined);
      }
    },
    [activeQuery, navigateWithQuery],
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearchOpen(true);

    if (activeQuery) {
      navigateWithQuery(undefined);
    }

    inputRef.current?.focus();
  }, [activeQuery, navigateWithQuery]);

  return {
    inputRef,
    openButtonRef,
    isSearchVisible,
    searchTerm,
    isHomeActive,
    isMarketActive,
    isMarketPage,
    setSearchTerm,
    handleOpenSearch,
    handleSearchBlur,
    handleSubmitSearch,
    handleSearchKeyDown,
    handleClearSearch,
    isSignedIn,
    initials: user ? getInitials(user.displayName) : '',
    firstName: user ? getFirstName(user.displayName) : '',
    openAuthModal,
  };
}
