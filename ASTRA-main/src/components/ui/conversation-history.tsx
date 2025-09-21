
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUserConversations } from '@/lib/database';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
}

export function ConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function fetchConversations() {
      try {
        const userConversations = await getUserConversations();
        setConversations(userConversations);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
      setIsLoading(false);
    }

    fetchConversations();
  }, [pathname]); // Refetch when path changes

  const handleNewChat = () => {
    router.push('/dashboard/legal-chatbot');
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/40 dark:bg-slate-800/40 p-2">
      <div className="mb-2">
        <Button onClick={handleNewChat} className="w-full justify-start">
          <PlusCircle className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
        Recent Chats
      </h3>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-1">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : (
            conversations.map((conv) => (
              <Button
                key={conv.id}
                variant={pathname.includes(conv.id) ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm truncate"
                onClick={() => router.push(`/dashboard/legal-chatbot?id=${conv.id}`)}
              >
                {conv.title}
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
