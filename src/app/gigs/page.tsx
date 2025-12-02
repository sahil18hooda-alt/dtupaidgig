import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import GigCard from '@/components/GigCard';
import { Gig, User } from '@/types';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getGigs() {
    const { data, error } = await supabase
        .from('gigs')
        .select(`
      *,
      profiles:created_by (*)
    `)
        .eq('status', 'Open')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching gigs:', error);
        return [];
    }

    return data as (Gig & { profiles: User })[];
}

export default async function GigsPage() {
    const gigs = await getGigs();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-[#242F57] font-display">Gigs</h1>
                    <p className="mt-2 text-[#959595] text-lg">Find the perfect gig for your skills.</p>
                </div>
                <div className="mt-6 md:mt-0">
                    <Link
                        href="/gigs/create"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-[#242F57] hover:bg-[#1a2240] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#242F57] transition-colors"
                    >
                        Post a Gig
                    </Link>
                </div>
            </div>

            {/* Filters Placeholder - matching the style */}
            <div className="flex gap-3 overflow-x-auto pb-6 mb-8 scrollbar-hide">
                {['All Gigs', 'Development', 'Design', 'Marketing', 'Writing'].map((category, index) => (
                    <button
                        key={category}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${index === 0
                                ? 'bg-[#242F57] text-white'
                                : 'bg-white text-[#959595] border border-gray-200 hover:border-[#242F57] hover:text-[#242F57]'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {gigs.map((gig) => (
                    <GigCard key={gig.id} gig={gig} />
                ))}
            </div>

            {gigs.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-[#959595] text-lg">No open gigs found. Be the first to post one!</p>
                </div>
            )}
        </div>
    );
}
