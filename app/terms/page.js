// This page is preserved for backwards compatibility.
// With next-intl middleware, /terms is rewritten to /fr/terms (internally)
// and served by app/[locale]/terms/page.js.
import { redirect } from 'next/navigation';
export default function TermsRedirect() { redirect('/terms'); }
