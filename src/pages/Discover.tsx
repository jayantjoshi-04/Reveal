import { Placeholder } from '../components/Placeholder';
import { A } from '../lib/assets';

export default function Discover() {
  return (
    <Placeholder
      eyebrow="Discover · Coming soon"
      title="Discover is on its way."
      blurb="Something new from Radikle is almost ready. Discover is coming soon — check back to watch it grow."
      image={A.discover.sprout}
    />
  );
}
