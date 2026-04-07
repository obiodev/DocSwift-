// This page is preserved for backwards compatibility.
// With next-intl middleware, /cv is rewritten to /fr/cv (internally)
// and served by app/[locale]/cv/page.js.
import { redirect } from 'next/navigation';
export default function CvRedirect() { redirect('/cv'); }
