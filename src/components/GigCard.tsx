
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Clock, DollarSign, Star, ArrowUpRight } from 'lucide-react';
import { Gig, User } from '@/types';

interface GigCardProps {
    gig: Gig & { profiles: User }; // Join with profiles table
}

export default function GigCard({ gig }: GigCardProps) {
    const isUrgent = new Date(gig.deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000;

    return (
        <Link href={`/gigs/${gig.id}`} className="block h-full">
            <div className="glass-card rounded-xl overflow-hidden card-hover h-full flex flex-col bg-white">
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {gig.category}
                        </span>
                        {isUrgent && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                                Urgent
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">
                        {gig.title}
                    </h3>

                    <div className="mt-auto pt-4">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                                <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-accent" />
                                <p>Due {formatDistanceToNow(new Date(gig.deadline), { addSuffix: true })}</p>
                            </div>
                            <div className="flex items-center font-bold text-gray-900">
                                <DollarSign className="flex-shrink-0 mr-1 h-4 w-4 text-accent" />
                                <span className="text-lg">{gig.price}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {gig.profiles?.avatar_url ? (
                                        <img
                                            className="h-9 w-9 rounded-full border-2 border-white shadow-sm"
                                            src={gig.profiles.avatar_url}
                                            alt={gig.profiles.full_name}
                                        />
                                    ) : (
                                        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
                                            <span className="text-xs font-bold text-gray-500">
                                                {gig.profiles?.full_name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {gig.profiles?.full_name || 'Unknown User'}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Star className="h-3 w-3 text-accent mr-1 fill-current" />
                                        <span>{gig.profiles?.rating_as_buyer?.toFixed(1) || 'New'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

