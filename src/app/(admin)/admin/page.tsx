import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  redirect('/admin/login?callbackUrl=/admin/dashboard');
}