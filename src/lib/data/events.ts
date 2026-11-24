export type CineFunction = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  venue: string;
  period: "upcoming" | "past";
};

const functions: CineFunction[] = [
  {
    id: "noche-de-cine-y-memoria",
    title: "Una noche de cine y memoria",
    description:
      "Un espacio para encontrarnos alrededor de historias que dejan huella.",
    startsAt: "2026-12-05T18:30:00-05:00",
    venue: "Auditorio principal",
    period: "upcoming",
  },
  {
    id: "miradas-de-medellin",
    title: "Miradas de Medellín",
    description:
      "Cortometrajes y conversación sobre las historias de nuestra ciudad.",
    startsAt: "2026-12-12T17:00:00-05:00",
    venue: "Bloque P · Sala múltiple",
    period: "upcoming",
  },
  {
    id: "cine-y-futuros-posibles",
    title: "Cine y futuros posibles",
    description:
      "Una función para imaginar otros futuros y conversar en comunidad.",
    startsAt: "2027-01-23T18:00:00-05:00",
    venue: "Auditorio principal",
    period: "upcoming",
  },
  {
    id: "historias-que-nos-unen",
    title: "Historias que nos unen",
    description:
      "Encuentro de cineclub con conversación abierta al final de la función.",
    startsAt: "2026-11-14T18:30:00-05:00",
    venue: "Bloque P · Sala múltiple",
    period: "past",
  },
  {
    id: "cine-en-comunidad",
    title: "Cine en comunidad",
    description:
      "Una tarde para compartir historias y nuevas perspectivas sobre el cine.",
    startsAt: "2026-10-17T16:00:00-05:00",
    venue: "Auditorio principal",
    period: "past",
  },
];

export function getCineFunctions(): CineFunction[] {
  return functions;
}
