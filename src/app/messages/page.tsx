'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Conversation, Gig, User } from '@/types';

type ConversationWithDetails = Conversation & {
    gigs: Gig;
    requester: User;
    solver: User;
};

export default function MessagesPage() {
    const { user, loading: authLoading } = useAuth();
    const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setLoading(false);
            return;
        }

        const fetchConversations = async () => {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
          *,
          gigs (*),
          requester:requester_id (*),
          solver:solver_id (*)
        `)
                .or(`requester_id.eq.${user.id},solver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching conversations:', error);
            } else {
                setConversations(data as ConversationWithDetails[]);
            }
            setLoading(false);
        };

        fetchConversations();
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Please log in to view messages.</p>
                <Link href="/login" className="text-primary hover:underline">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {conversations.map((conversation) => {
                        const otherUser = conversation.requester_id === user?.id ? conversation.solver : conversation.requester;
                        return (
                            <li key={conversation.id}>
                                <Link href={`/messages/${conversation.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                {conversation.gigs.title}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {conversation.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {otherUser.full_name}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    {new Date(conversation.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                    {conversations.length === 0 && (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                            No conversations yet.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
