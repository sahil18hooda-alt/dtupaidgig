import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import GigCard from '@/components/GigCard';
import { Gig, User } from '@/types';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100 pt-32 pb-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6 animate-fade-in-up">
            <Sparkles className="w-4 h-4" />
            <span>The #1 Marketplace for DTU Students</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6 font-display">
            Turn your <span className="text-gradient">skills</span> into <br />
            <span className="text-gradient">earnings</span> today.
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with peers to solve academic challenges. Whether you need help with a lab file or want to earn by coding, CampusGig is your platform.
          </p>
          <div className="space-y-10">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative px-8 py-16 sm:px-16 sm:py-24 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                    Campus Marketplace <span className="text-accent">@ DTU</span>
                  </h1>
                  <p className="text-lg text-rose-100 mb-8 max-w-lg">
                    The official hub for DTU students to find help with assignments, projects, and labs. Earn money or get things done.
                  </p>
                  <Link
                    href="/gigs/create"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-primary bg-white hover:bg-gray-50 shadow-lg transition-all hover:scale-105"
                  >
                    Post a Gig
                  </Link>
                </div>
                <div className="hidden sm:block">
                  {/* Abstract decorative element or illustration could go here */}
                  <div className="w-64 h-64 bg-white/10 rounded-full blur-3xl absolute -right-16 -top-16"></div>
                  <div className="w-48 h-48 bg-accent/20 rounded-full blur-2xl absolute right-12 bottom-12"></div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {['All', 'Lab File', 'Assignment', 'Project', 'Coding'].map((category) => (
                <button
                  key={category}
                  className="px-6 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm whitespace-nowrap"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search gigs..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>

        {gigs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No gigs found</h3>
            <p className="text-gray-500">Be the first to post a gig in this category!</p>
          </div>
        )}
      </main>
    </div>
  );
}
