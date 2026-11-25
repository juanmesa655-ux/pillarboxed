export type LandingEvent = {
  title: string;
  startsAt: string | null;
  simulated: boolean;
};

const landingEvent: LandingEvent = {
  title: "Cine y memoria: una primera mirada",
  startsAt: null,
  simulated: true,
};

export function getLandingEvent(): LandingEvent {
  return landingEvent;
}
