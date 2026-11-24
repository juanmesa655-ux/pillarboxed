export default function Loading() {
  return (
    <main
      className="mx-auto min-h-[60vh] max-w-300 px-4 py-10 sm:px-6 sm:py-14"
      role="status"
      aria-label="Cargando eventos"
    >
      <div className="animate-pulse">
        <div className="h-3 w-24 bg-(--surface)" />
        <div className="mt-4 h-10 w-64 bg-(--surface)" />
        <div className="mt-4 h-4 max-w-xl bg-(--surface)" />
        <div className="mt-8 h-16 border-y border-border bg-(--surface)/40" />
        <div className="mt-6 space-y-3">
          <div className="h-28 border border-border bg-(--surface)/40" />
          <div className="h-28 border border-border bg-(--surface)/40" />
        </div>
      </div>
      <span className="sr-only">Cargando la sección de eventos...</span>
    </main>
  );
}
