import { redirect } from 'next/navigation';

export default function Home() {
  // Automatically direct to Stage 1 Requester Hub (teammate will add common login space here later)
  redirect('/requestor');
}
