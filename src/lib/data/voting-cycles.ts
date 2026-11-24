export type VotingCycleStatus = "open" | "upcoming" | "closed";

export type VotingCycle = {
  id: string;
  title: string;
  description: string;
  opensAt: string;
  closesAt: string;
  candidateCount: number;
  status: VotingCycleStatus;
  resultsPublished: boolean;
};

const votingCycles: VotingCycle[] = [
  {
    id: "cine-latinoamericano",
    title: "Cine latinoamericano",
    description:
      "Elige la próxima película para una función dedicada a las historias de nuestra región.",
    opensAt: "2026-11-20T08:00:00-05:00",
    closesAt: "2026-11-30T23:59:00-05:00",
    candidateCount: 4,
    status: "open",
    resultsPublished: false,
  },
  {
    id: "memorias-de-la-ciudad",
    title: "Memorias de la ciudad",
    description:
      "Pronto podrás elegir entre historias que retratan la memoria y la vida urbana.",
    opensAt: "2026-12-02T08:00:00-05:00",
    closesAt: "2026-12-09T23:59:00-05:00",
    candidateCount: 3,
    status: "upcoming",
    resultsPublished: false,
  },
  {
    id: "cine-y-comunidad",
    title: "Cine y comunidad",
    description:
      "Ciclo cerrado. La comunidad ya eligió la película de esta función.",
    opensAt: "2026-11-05T08:00:00-05:00",
    closesAt: "2026-11-12T23:59:00-05:00",
    candidateCount: 4,
    status: "closed",
    resultsPublished: true,
  },
];

export function getVotingCycles(): VotingCycle[] {
  return votingCycles;
}
