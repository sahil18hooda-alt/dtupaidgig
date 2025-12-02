'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Trash2 } from 'lucide-react';

interface DeleteGigButtonProps {
    gigId: string;
    creatorId: string;
}

export default function DeleteGigButton({ gigId, creatorId }: DeleteGigButtonProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Only show button if current user is the creator
    if (!user || user.id !== creatorId) {
        return null;
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to close this gig? This action cannot be undone.')) {
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('gigs')
                .delete()
                .eq('id', gigId);

            if (error) {
                throw error;
            }

            // Redirect to home page after successful deletion
            router.push('/');
            router.refresh(); // Refresh to update the list
        } catch (error) {
            console.error('Error deleting gig:', error);
            alert('Failed to delete gig. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-red-700 shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed ml-4"
        >
            <Trash2 className="w-4 h-4 mr-2" />
            {loading ? 'Closing...' : 'Close Gig'}
        </button>
    );
}
