"use client";

import { Combobox } from "@base-ui/react/combobox";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigateWithDocumentLoad } from "@/components/errors/full-page-navigation-link";
import { tmdbMovieRepository, type MovieSummary, type SearchMoviesResult } from "@/lib/data/movies";

type SearchState =
  | { status: "idle" | "loading" | "empty" }
  | { status: "ready"; movies: MovieSummary[]; totalResults: number }
  | {
      status: "error";
      reason: Exclude<Extract<SearchMoviesResult, { ok: false }>["reason"], "aborted">;
    };

function isTextEntryTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("input, textarea, select, [contenteditable='true']") !==
        null)
  );
}

function errorMessage(
  reason: Exclude<Extract<SearchMoviesResult, { ok: false }>["reason"], "aborted">,
) {
  if (reason === "not-configured") {
    return "El catálogo aún no está configurado. Intenta de nuevo más tarde.";
  }
  if (reason === "invalid-query") {
    return "Escribe un título válido para buscar.";
  }
  if (reason === "invalid-data") {
    return "No pudimos interpretar la respuesta de búsqueda.";
  }
  return "No pudimos cargar la búsqueda. Intenta de nuevo.";
}

export function MovieSearchBar({
  fullPageNavigation = false,
}: {
  fullPageNavigation?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const suggestions =
    state.status === "ready" ? state.movies.slice(0, 6) : [];

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.key !== "/" || isTextEntryTarget(event.target)) return;

      event.preventDefault();
      setMobileExpanded(true);
      setOpen(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!open || normalizedQuery.length === 0) return;

    let controller: AbortController | null = null;
    const timeout = window.setTimeout(() => {
      controller = new AbortController();
      setState({ status: "loading" });

      void tmdbMovieRepository
        .searchMovies(normalizedQuery, controller.signal)
        .then((result) => {
          if (controller?.signal.aborted) return;

          if (result.ok) {
            setState(
              result.movies.length === 0
                ? { status: "empty" }
                : {
                    status: "ready",
                    movies: result.movies,
                    totalResults: result.totalResults,
                  },
            );
            return;
          }

          if (result.reason !== "aborted") {
            setState({ status: "error", reason: result.reason });
          }
        });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller?.abort();
    };
  }, [attempt, open, query]);

  function navigateToResults(searchTerm: string) {
    const normalizedQuery = searchTerm.trim();
    if (!normalizedQuery) return;

    setOpen(false);
    setMobileExpanded(false);
    const destination = `/buscar?q=${encodeURIComponent(normalizedQuery)}`;
    if (fullPageNavigation) {
      navigateWithDocumentLoad(destination);
    } else {
      router.push(destination);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateToResults(query);
  }

  const inputGroupClassName = [
    "relative flex h-10 items-center rounded-full border border-border bg-(--surface) text-(--fg-secondary) transition-[width] duration-150 focus-within:border-(--border-strong) focus-within:text-(--fg)",
    mobileExpanded
      ? "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[calc(100vw-2rem)] max-w-88 sm:static sm:top-auto sm:right-auto"
      : "hidden sm:flex sm:w-40",
    open && "sm:w-72",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative flex shrink-0 justify-end sm:flex-1 sm:justify-center">
      {!mobileExpanded && (
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-border text-(--fg-secondary) hover:border-(--border-strong) hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:hidden"
          aria-label="Abrir búsqueda de películas"
          onClick={() => {
            setMobileExpanded(true);
            setOpen(true);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
        >
          <Search aria-hidden="true" size={18} />
        </button>
      )}

      <Combobox.Root<MovieSummary>
        items={suggestions}
        inputValue={query}
        onInputValueChange={(nextQuery) => {
          setQuery(nextQuery);
          setState({ status: "idle" });
        }}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen && mobileExpanded) setMobileExpanded(false);
        }}
        onValueChange={(movie) => {
          if (movie) navigateToResults(movie.title);
        }}
        itemToStringLabel={(movie) => movie.title}
        filter={null}
        autoHighlight
      >
        <form role="search" aria-label="Buscar películas" onSubmit={handleSubmit}>
          <Combobox.InputGroup className={inputGroupClassName}>
            <Combobox.Input
              ref={inputRef}
              name="q"
              aria-label="Buscar películas"
              autoComplete="off"
              maxLength={100}
              onFocus={() => setOpen(true)}
              className="h-full min-w-0 flex-1 border-0 bg-transparent px-2 text-sm text-(--fg) outline-none placeholder:text-(--fg-muted)"
            />
            <kbd className="mr-3 hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-(--fg-muted) sm:inline">
              /
            </kbd>
            <button
              type="submit"
              aria-label="Ver resultados de búsqueda"
              className="flex size-9 shrink-0 items-center justify-center text-(--fg-secondary) hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Search aria-hidden="true" size={16} />
            </button>
            {mobileExpanded && (
              <button
                type="button"
                aria-label="Cerrar búsqueda"
                className="mr-1 flex size-8 shrink-0 items-center justify-center text-(--fg-secondary) hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-accent sm:hidden"
                onClick={() => {
                  setOpen(false);
                  setMobileExpanded(false);
                  setQuery("");
                }}
              >
                <X aria-hidden="true" size={16} />
              </button>
            )}
          </Combobox.InputGroup>
        </form>

        <Combobox.Portal>
          <Combobox.Positioner
            className="z-50 outline-none"
            sideOffset={6}
            align="start"
          >
            <Combobox.Popup className="max-h-[min(70vh,28rem)] w-[var(--anchor-width)] max-w-[calc(100vw-2rem)] overflow-y-auto border border-border bg-(--surface-elevated) text-(--fg) shadow-xl">
              {state.status === "loading" && (
                <p className="px-4 py-3 text-sm text-(--fg-secondary)" role="status">
                  Buscando películas...
                </p>
              )}
              {state.status === "idle" && (
                <p className="px-4 py-3 text-sm text-(--fg-muted)">
                  Escribe un título para buscar.
                </p>
              )}
              {state.status === "empty" && (
                <p className="px-4 py-3 text-sm text-(--fg-secondary)" role="status">
                  No encontramos películas con ese título.
                </p>
              )}
              {state.status === "error" && (
                <div className="px-4 py-3" role="alert">
                  <p className="text-sm text-(--fg-secondary)">
                    {errorMessage(state.reason)}
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-sm text-accent underline underline-offset-4"
                    onClick={() => setAttempt((current) => current + 1)}
                  >
                    Volver a intentar
                  </button>
                </div>
              )}
              {state.status === "ready" && (
                <>
                  <Combobox.List className="py-1">
                    {(movie: MovieSummary) => {
                      const year = movie.releaseDate?.match(/^\d{4}/)?.[0];
                      const posterUrl = movie.posterPath
                        ? `https://image.tmdb.org/t/p/w200${movie.posterPath}`
                        : null;

                      return (
                        <Combobox.Item
                          key={movie.id}
                          value={movie}
                          className="flex w-full cursor-default items-center gap-3 px-3 py-2 text-left outline-none data-highlighted:bg-(--surface) data-highlighted:text-(--fg)"
                        >
                          {posterUrl ? (
                            <Image
                              src={posterUrl}
                              alt=""
                              width={36}
                              height={54}
                              className="h-13.5 w-9 shrink-0 object-cover"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="h-13.5 w-9 shrink-0 border border-border bg-(--surface)"
                            />
                          )}
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {movie.title}
                            </span>
                            <span className="mt-1 block font-mono text-xs text-(--fg-muted)">
                              {year ?? "Año no disponible"}
                            </span>
                          </span>
                        </Combobox.Item>
                      );
                    }}
                  </Combobox.List>
                  <button
                    type="button"
                    className="w-full border-t border-border px-4 py-3 text-left text-sm text-accent hover:bg-(--surface)"
                    onClick={() => navigateToResults(query)}
                  >
                    Ver todos los resultados
                    {state.totalResults > 6 && ` (${state.totalResults})`}
                  </button>
                </>
              )}
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
