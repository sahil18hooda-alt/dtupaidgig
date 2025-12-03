'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // 1. Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (mounted) {
                    setSession(session);
                    if (session?.user) {
                        // Optimistically set user from session metadata first
                        setUser({
                            id: session.user.id,
                            email: session.user.email!,
                            full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
                            avatar_url: session.user.user_metadata.avatar_url,
                            // Default values for other fields until profile loads
                            bio: '',
                            rating_as_buyer: 0,
                            rating_as_seller: 0,
                            total_gigs_completed: 0,
                            created_at: new Date().toISOString()
                        });

                        // Then fetch full profile in background
                        fetchUserProfile(session.user.id);
                    }
                }
            } catch (err) {
                console.error('AuthContext: Initialization error:', err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            setSession(session);

            if (session?.user) {
                // Same optimistic update pattern
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
                    avatar_url: session.user.user_metadata.avatar_url,
                    bio: '',
                    rating_as_buyer: 0,
                    rating_as_seller: 0,
                    total_gigs_completed: 0,
                    created_at: new Date().toISOString()
                });
                await fetchUserProfile(session.user.id);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (userId: string) => {
        try {
            // 1. Try to fetch the user profile
            let { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setUser(data);
                return;
            }

            // 2. If not found (PGRST116), try to create it
            if (error && error.code === 'PGRST116') {
                console.log('User profile missing, creating...');
                const { data: sessionData } = await supabase.auth.getSession();
                const sessionUser = sessionData.session?.user;

                if (sessionUser) {
                    const { data: newUser, error: createError } = await supabase
                        .from('users')
                        .insert({
                            id: userId,
                            email: sessionUser.email!,
                            full_name: sessionUser.user_metadata.full_name || sessionUser.email?.split('@')[0] || 'User',
                            avatar_url: sessionUser.user_metadata.avatar_url,
                        })
                        .select()
                        .single();

                    if (newUser) {
                        setUser(newUser);
                    } else if (createError) {
                        console.warn('Error creating user profile (might already exist):', createError);
                        // 3. Retry fetch in case of race condition (trigger created it)
                        const { data: retryData } = await supabase
                            .from('users')
                            .select('*')
                            .eq('id', userId)
                            .single();

                        if (retryData) {
                            setUser(retryData);
                        }
                    }
                }
            } else {
                console.error('Error fetching user profile:', error);
            }
        } catch (error) {
            console.error('Unexpected error fetching user profile:', error);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
