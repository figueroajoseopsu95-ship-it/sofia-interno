import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect root to /dashboard — served under (dashboard) route group
  // which applies sidebar, header and auth guard via (dashboard)/layout.tsx.
  redirect('/dashboard');
}
