'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MessageCircle } from 'lucide-react';

interface ContactSellerButtonProps {
    gigId: string;
    sellerId: string;
    gigTitle: string;
}

export default function ContactSellerButton({ gigId, sellerId, gigTitle }: ContactSellerButtonProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleContact = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (user.id === sellerId) {
            alert("You cannot contact yourself!");
            return;
        }

        setLoading(true);

        try {
            // 1. Check if conversation already exists
            const { data: existingConvos, error: fetchError } = await supabase
                .from('conversations')
                .select('id')
                .eq('gig_id', gigId)
                .eq('requester_id', user.id)
                .eq('solver_id', sellerId)
                .single();

            if (existingConvos) {
                router.push(`/messages/${existingConvos.id}`);
                return;
            }

            // 2. Create new conversation
            const { data: newConvo, error: createError } = await supabase
                .from('conversations')
                .insert({
                    gig_id: gigId,
                    requester_id: user.id,
                    solver_id: sellerId,
                    status: 'Active'
                })
                .select()
                .single();

            if (createError) throw createError;

            // 3. Send initial message (optional, but good UX)
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: newConvo.id,
                    sender_id: user.id,
                    content: `Hi, I'm interested in your gig: "${gigTitle}"`,
                    is_offer: false
                });

            if (msgError) throw msgError;

            router.push(`/messages/${newConvo.id}`);

        } catch (error) {
            console.error('Error contacting seller:', error);
            alert('Failed to start conversation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleContact}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <MessageCircle className="w-4 h-4 mr-2" />
            {loading ? 'Connecting...' : 'Contact Seller'}
        </button>
    );
}
