import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Clock, DollarSign, Star } from 'lucide-react';
import { Gig, User } from '@/types';

interface GigCardProps {
    gig: Gig & { profiles: User }; // Join with profiles table
}

export default function GigCard({ gig }: GigCardProps) {
    const isUrgent = new Date(gig.deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000;

    return (
        <Link href={`/gigs/${gig.id}`} className="block group">
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300 h-full flex flex-col border border-transparent hover:border-gray-100">
                {/* Header: Tags */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#F2F4F7] text-gray-600">
                            {gig.category}
                        </span>
                        {isUrgent && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                                Urgent
                            </span>
                        )}
                    </div>
                </div>

                {/* Body: Title */}
                <h3 className="text-xl font-bold text-[#242F57] line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors font-display">
                    {gig.title}
                </h3>

                {/* Company/User Name */}
                <p className="text-[#959595] text-sm mb-6 font-medium">
                    {gig.profiles?.full_name || 'Unknown User'}
                </p>

                {/* Footer: Meta Info */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                        {gig.profiles?.avatar_url ? (
                            <img
                                className="h-8 w-8 rounded-full object-cover"
                                src={gig.profiles.avatar_url}
                                alt={gig.profiles.full_name}
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#242F57] font-bold text-xs">
                                {gig.profiles?.full_name?.charAt(0) || 'U'}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs text-[#959595]">Posted by</span>
                            <div className="flex items-center text-xs font-medium text-[#242F57]">
                                <Star className="h-3 w-3 text-yellow-400 mr-1 fill-current" />
                                <span>{gig.profiles?.rating_as_buyer?.toFixed(1) || 'New'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-[#242F57]">${gig.price}</span>
                        <span className="text-xs text-[#959595]">Fixed Price</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
