// Fallback only — in normal operation the next-intl middleware rewrites '/'
// to '/fr' before this route is even evaluated.
import { redirect } from 'next/navigation';
export default function RootPage() {
  redirect('/fr');
}
