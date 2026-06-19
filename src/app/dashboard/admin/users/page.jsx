import AdminUsersView from '@/components/admin/AdminUsersView';

export const metadata = {
  title: 'User Directory | NexaChat Admin',
  description: 'Manage NexaChat users and platform access',
};

export default function AdminUsersPage() {
  return <AdminUsersView />;
}
