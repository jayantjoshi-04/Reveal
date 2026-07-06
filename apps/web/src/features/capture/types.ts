/** Contract every capture module component honours. */
export interface ModuleProps {
  onSubmit: (payload: unknown, responseMs?: number) => void;
  busy: boolean;
}

export const SESSION_TITLES: Record<number, string> = {
  1: 'Foundations',
  2: 'Values & direction',
  3: 'Pulls, aspiration & reflection',
};
