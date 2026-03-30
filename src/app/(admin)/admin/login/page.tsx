import AdminLoginForm from './AdminLoginForm';

type AdminLoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
};

function getSafeAdminCallbackUrl(rawCallbackUrl: string | string[] | undefined): string {
  const callbackUrl = Array.isArray(rawCallbackUrl) ? rawCallbackUrl[0] : rawCallbackUrl;
  return callbackUrl?.startsWith('/admin') ? callbackUrl : '/admin/dashboard';
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = getSafeAdminCallbackUrl(resolvedSearchParams.callbackUrl);

  return (
    <AdminLoginForm callbackUrl={callbackUrl} />
  );
}
