'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
// import { Button } from '@/components/ui/button'; // Removed unused import
import { Menu, User as UserIcon } from 'lucide-react';

export default function Navbar() {
    const { user, signOut } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-2xl font-bold text-indigo-600">
                                CampusGig
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/messages" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                                    Messages
                                </Link>
                                <Link href="/gigs/create" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                                    Post a Gig
                                </Link>
                                <div className="relative">
                                    <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                                        <UserIcon className="h-5 w-5" />
                                        <span className="hidden sm:inline">{user.full_name}</span>
                                    </button>
                                </div>
                                <button
                                    onClick={signOut}
                                    className="text-sm font-medium text-red-600 hover:text-red-800"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
