// This page is preserved for backwards compatibility.
// With next-intl middleware, /tools is rewritten to /fr/tools (internally)
// and served by app/[locale]/tools/page.js.
import { redirect } from 'next/navigation';
export default function ToolsRedirect() { redirect('/tools'); }
