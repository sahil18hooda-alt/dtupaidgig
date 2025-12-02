'use client';

import { useEffect, useState, use } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: PageProps) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const [conversation, setConversation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchConversation = async () => {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    gigs(*),
                    requester:requester_id(*),
                    solver:solver_id(*)
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching conversation:', error);
                setConversation(null);
            } else {
                setConversation(data);
            }
            setLoading(false);
        };

        fetchConversation();
    }, [id, user, authLoading]);

    if (authLoading || loading) {
        return <div className="p-8 text-center">Loading chat...</div>;
    }

    if (!conversation) {
        return <div className="p-8 text-center">Conversation not found or access denied.</div>;
    }

    const otherUser = conversation.requester_id === user?.id ? conversation.solver : conversation.requester;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900">
                    Chat: {conversation.gigs.title}
                </h1>
            </div>
            <ChatWindow
                conversationId={id}
                gigId={conversation.gigs.id}
                gigCreatorId={conversation.gigs.created_by}
                gigStatus={conversation.gigs.status}
                otherUserName={otherUser?.full_name || 'User'}
            />
        </div>
    );
}
