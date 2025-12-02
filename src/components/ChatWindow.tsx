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
            .channel(`conversation:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAssignGig = async () => {
        console.log('handleAssignGig called');
        console.log('Values:', { gigId, conversationId, userId: user?.id, gigCreatorId, currentGigStatus });

        if (!confirm(`Are you sure you want to assign this gig to ${otherUserName}? It will be removed from the public list.`)) {
            console.log('Assignment cancelled by user');
            return;
        }

        try {
            console.log('Starting assignment process...');

            // 1. Update Gig status
            console.log('Updating gig status...');
            const { error: gigError } = await supabase
                .from('gigs')
                .update({ status: 'Assigned' })
                .eq('id', gigId);

            if (gigError) {
                console.error('Error updating gig status:', gigError);
                throw gigError;
            }
            console.log('Gig status updated.');

            // 2. Update Conversation status
            console.log('Updating conversation status...');
            const { error: convoError } = await supabase
                .from('conversations')
                .update({ status: 'Accepted' })
                .eq('id', conversationId);

            if (convoError) {
                console.error('Error updating conversation status:', convoError);
                throw convoError;
            }
            console.log('Conversation status updated.');

            // 3. Send system message
            console.log('Sending system message...');
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user!.id,
                    content: `🎉 Gig assigned to ${otherUserName}!`,
                    is_offer: false,
                });

            if (msgError) {
                console.error('Error sending system message:', msgError);
                throw msgError;
            }
            console.log('System message sent.');

            setCurrentGigStatus('Assigned');
            alert('Gig assigned successfully!');

        } catch (error) {
            console.error('Error assigning gig:', error);
            alert(`Failed to assign gig: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    };

    const handleSendOffer = async (price: number) => {
        if (!user) return;

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
        }
    };

    const handleAcceptOffer = async (messageId: string, price: number) => {
        // Reuse the assign logic if accepting an offer implies assignment
        // For now, we'll just log it as the main "Assign" button is the primary action requested
        console.log('Accepting offer:', price);
        handleAssignGig();
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: newMessage,
            });

        if (error) {
            console.error('Error sending message:', error);
        } else {
            setNewMessage('');
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
                                className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${isOwn
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                    }`}
                            >
                                <p>{message.content}</p>
                                {message.is_offer && !isOwn && user?.id === gigCreatorId && currentGigStatus === 'Open' && (
                                    <button
                                        onClick={() => message.offer_price && handleAcceptOffer(message.id, message.offer_price)}
                                        className="mt-2 bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
                                    >
                                        Accept Offer & Assign
                                    </button>
                                )}
                                <p className={`text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2 mb-2">
                    <button
                        onClick={() => {
                            const price = prompt('Enter offer amount:');
                            if (price) handleSendOffer(parseInt(price));
                        }}
                        className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                    >
                        Make Offer
                    </button>
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
