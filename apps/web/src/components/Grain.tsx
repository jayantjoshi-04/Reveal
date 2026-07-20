/** Full-bleed film-grain overlay — subtle texture so surfaces don't feel flat.
 *  Fixed, non-interactive, low opacity, soft-light blend. */
export function Grain(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="bg-grain pointer-events-none fixed inset-0 z-[1] opacity-[0.05] mix-blend-soft-light dark:opacity-[0.08]"
    />
  );
}
