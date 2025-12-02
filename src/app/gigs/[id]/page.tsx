import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Gig, User } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Clock, DollarSign, User as UserIcon, Calendar, ArrowLeft } from 'lucide-react';
import ContactSellerButton from '@/components/ContactSellerButton';
import DeleteGigButton from '@/components/DeleteGigButton';

// Revalidate every 60 seconds
export const revalidate = 60;

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getGig(id: string) {
    const { data, error } = await supabase
        .from('gigs')
        .select(`
      *,
      profiles:created_by (*)
    `)
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error('Error fetching gig:', error);
        return null;
    }

    return data as Gig & { profiles: User };
}

export default async function GigDetailPage({ params }: PageProps) {
    const { id } = await params;
    const gig = await getGig(id);

    if (!gig) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Gigs
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl leading-6 font-bold text-gray-900">
                            {gig.title}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Posted {formatDistanceToNow(new Date(gig.created_at), { addSuffix: true })}
                        </p>
                    </div>
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
            ${gig.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {gig.status}
                    </span>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <UserIcon className="w-4 h-4 mr-2" /> Seller
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 font-semibold flex items-center">
                                {gig.profiles?.avatar_url && (
                                    <img
                                        src={gig.profiles.avatar_url}
                                        alt=""
                                        className="w-6 h-6 rounded-full mr-2"
                                    />
                                )}
                                {gig.profiles?.full_name || 'Unknown User'}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" /> Category
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {gig.category}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <Clock className="w-4 h-4 mr-2" /> Deadline
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {new Date(gig.deadline).toLocaleDateString()}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <DollarSign className="w-4 h-4 mr-2" /> Price
                            </dt>
                            <dd className="mt-1 text-2xl font-bold text-indigo-600">
                                ₹{gig.price}
                            </dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap border p-4 rounded-md bg-gray-50">
                                {gig.description}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
                    <ContactSellerButton
                        gigId={gig.id}
                        sellerId={gig.created_by}
                        gigTitle={gig.title}
                    />
                    <DeleteGigButton
                        gigId={gig.id}
                        creatorId={gig.created_by}
                    />
                </div>
            </div>
        </div>
    );
}
