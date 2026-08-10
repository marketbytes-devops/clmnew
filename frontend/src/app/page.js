import { redirect } from 'next/navigation';

export default function Home() {
  // Automatically redirect to the admin dashboard
  redirect('/admin');
}
