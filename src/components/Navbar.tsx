'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
// import { Button } from '@/components/ui/button'; // Removed unused import
import { Menu, User as UserIcon, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, session, loading, signOut } = useAuth();

    return (
        <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/20 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            C
                        </div>
                        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-display tracking-tight">
                            CampusGig
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                    </div>
                    <div className="flex items-center">
                        {loading ? (
                            <div className="flex items-center gap-4">
                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                            </div>
                        ) : session ? (
                            <div className="flex items-center gap-6">
                                <Link href="/messages" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                                    Messages
                                </Link>
                                <Link href="/gigs/create" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                                    Post a Gig
                                </Link>
                                <div className="relative flex items-center gap-3 pl-4 border-l border-gray-200">
                                    <div className="flex flex-col items-end hidden sm:flex">
                                        <span className="text-sm font-medium text-gray-900">
                                            {user?.full_name || session.user.email?.split('@')[0] || 'User'}
                                        </span>
                                        <button
                                            onClick={signOut}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            (user?.full_name || session.user.email)?.charAt(0).toUpperCase() || <UserIcon className="h-5 w-5" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="btn-primary inline-flex items-center px-4 py-2 text-sm font-medium rounded-full shadow-sm"
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
