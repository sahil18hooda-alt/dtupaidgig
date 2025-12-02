'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';

interface RatingModalProps {
    gigId: string;
    reviewerId: string;
    revieweeId: string;
    onClose: () => void;
}

export default function RatingModal({ gigId, reviewerId, revieweeId, onClose }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setLoading(true);

        const { error } = await supabase
            .from('reviews')
            .insert({
                gig_id: gigId,
                reviewer_id: reviewerId,
                reviewee_id: revieweeId,
                rating,
                comment,
            });

        if (error) {
            console.error('Error submitting review:', error);
        } else {
            // Calculate new average rating for reviewee
            // This should ideally be done via a Trigger or Edge Function
            // For MVP, we'll skip updating the user profile aggregate here 
            // and rely on the database trigger or future implementation.
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Rate your experience</h3>
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center space-x-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`focus:outline-none ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                <Star className="h-8 w-8 fill-current" />
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="w-full border border-gray-300 rounded-md p-2 mb-4"
                        rows={3}
                        placeholder="Write a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
