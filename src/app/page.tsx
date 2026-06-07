import { redirect } from 'next/navigation';

// Root now lands on the Dashboard; legacy Advanced Analytics was consolidated
// into /stats during the Phase 0 restructure.
export default function Page() {
  redirect('/dashboard');
}
