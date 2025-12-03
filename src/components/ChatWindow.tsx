'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types';
import { Send } from 'lucide-react';

interface ChatWindowProps {
    conversationId: string;
    gigId: string;
    gigCreatorId: string;
    gigStatus: string;
    otherUserName: string;
}

export default function ChatWindow({ conversationId, gigId, gigCreatorId, gigStatus, otherUserName }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentGigStatus, setCurrentGigStatus] = useState(gigStatus);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching messages:', error);
            } else {
                setMessages(data as Message[]);
            }
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;

                    // Prevent duplicates from own optimistic updates
                    // We check if we already have this message ID
                    setMessages((prev) => {
                        if (prev.some(m => m.id === newMessage.id)) {
                            return prev;
                        }
                        return [...prev, newMessage];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAssignGig = async () => {
        if (!confirm(`Are you sure you want to assign this gig to ${otherUserName}? It will be removed from the public list.`)) {
            return;
        }

        try {
            // 1. Update Gig status
            const { error: gigError } = await supabase
                .from('gigs')
                .update({ status: 'Assigned' })
                .eq('id', gigId);

            if (gigError) throw gigError;

            // 2. Update Conversation status
            const { error: convoError } = await supabase
                .from('conversations')
                .update({ status: 'Accepted' })
                .eq('id', conversationId);

            if (convoError) throw convoError;

            // 3. Send system message
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user!.id,
                    content: `🎉 Gig assigned to ${otherUserName}!`,
                    is_offer: false,
                });

            if (msgError) throw msgError;

            setCurrentGigStatus('Assigned');
            alert('Gig assigned successfully!');

        } catch (error) {
            console.error('Error assigning gig:', error);
            alert(`Failed to assign gig: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    };

    const handleSendOffer = async (price: number) => {
        if (!user) return;

        // Optimistic update
        const optimisticMessage: Message = {
            id: crypto.randomUUID(),
            conversation_id: conversationId,
            sender_id: user.id,
            content: `Offered: ₹${price}`,
            is_offer: true,
            offer_price: price,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: `Offered: ₹${price}`,
                is_offer: true,
                offer_price: price,
            });

        if (error) {
            console.error('Error sending offer:', error);
            // Rollback optimistic update if needed, but for now just log error
            alert('Failed to send offer. Please try again.');
            setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
        }
    };

    const handleAcceptOffer = async (messageId: string, price: number) => {
        console.log('Accepting offer:', price);
        handleAssignGig();
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const messageContent = newMessage;
        setNewMessage(''); // Clear input immediately

        // Optimistic update
        const optimisticMessage: Message = {
            id: crypto.randomUUID(),
            conversation_id: conversationId,
            sender_id: user.id,
            content: messageContent,
            created_at: new Date().toISOString(),
            is_offer: false
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: messageContent,
            });

        if (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
            setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
            setNewMessage(messageContent); // Restore input
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header with Assign Button */}
            {user?.id === gigCreatorId && currentGigStatus === 'Open' && (
                <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                    <p className="text-sm text-indigo-800">
                        Chatting with potential candidate: <span className="font-semibold">{otherUserName}</span>
                    </p>
                    <button
                        onClick={handleAssignGig}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-indigo-700 shadow-sm"
                    >
                        Assign Gig
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                        <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs sm:max-w-md px-5 py-3 rounded-2xl shadow-sm ${isOwn
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-white border border-gray-100 text-gray-900 rounded-bl-none'
                                    }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                {message.is_offer && !isOwn && user?.id === gigCreatorId && currentGigStatus === 'Open' && (
                                    <button
                                        onClick={() => message.offer_price && handleAcceptOffer(message.id, message.offer_price)}
                                        className="mt-3 w-full bg-green-500 text-white text-xs px-3 py-2 rounded-lg hover:bg-green-600 font-medium transition-colors"
                                    >
                                        Accept Offer & Assign
                                    </button>
                                )}
                                <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => {
                            const price = prompt('Enter offer amount:');
                            if (price) handleSendOffer(parseInt(price));
                        }}
                        className="text-xs bg-accent/10 text-accent-dark px-3 py-1.5 rounded-full hover:bg-accent/20 font-medium transition-colors border border-accent/20"
                    >
                        Make Offer
                    </button>
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-primary text-white p-2.5 rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
