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
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session?.user) {
                await fetchUserProfile(session.user.id);
            }
            setLoading(false);
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                await fetchUserProfile(session.user.id);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
                console.error('Error fetching user profile:', error);
            } else if (data) {
                setUser(data);
            } else {
                // User profile doesn't exist, create it
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

                    if (createError) {
                        console.error('Error creating user profile:', createError);
                    } else {
                        setUser(newUser);
                    }
                }
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
