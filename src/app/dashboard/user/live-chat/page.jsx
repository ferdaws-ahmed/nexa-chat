import LiveChatHandover from '@/components/dashboard/LiveChatHandover';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Live Chat Control | NexaChat',
  description: 'Manage AI-Human handover and live conversations',
};

export default function LiveChatPage() {
  return <LiveChatHandover />;
}
