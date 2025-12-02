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

export default async function Home() {
  const gigs = await getGigs();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Marketplace</h1>
          <p className="mt-2 text-gray-600">Find help with your academic tasks or earn money by solving them.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/gigs/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Post a Gig
          </Link>
        </div>
      </div>

      {/* Filters (Placeholder for now, can be enhanced with search params) */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Lab File', 'Assignment', 'Project', 'Coding'].map((category) => (
          <button
            key={category}
            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gigs.map((gig) => (
          <GigCard key={gig.id} gig={gig} />
        ))}
      </div>

      {gigs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No open gigs found. Be the first to post one!</p>
        </div>
      )}
    </div>
  );
}
