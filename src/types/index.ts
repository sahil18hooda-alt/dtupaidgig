export type User = {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    rating_as_buyer: number;
    rating_as_seller: number;
    total_gigs_completed: number;
    created_at?: string;
};

export type Gig = {
    id: string;
    created_by: string;
    title: string;
    description: string;
    category: 'Lab File' | 'Assignment' | 'Project' | 'Coding' | 'Other';
    deadline: string;
    price: number;
    attachment_url?: string;
    status: 'Open' | 'Assigned' | 'Completed';
    created_at: string;
};

export type Conversation = {
    id: string;
    gig_id: string;
    requester_id: string;
    solver_id: string;
    status: 'Active' | 'Accepted' | 'Closed';
    created_at: string;
};

export type Message = {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_offer: boolean;
    offer_price?: number;
    created_at: string;
};

export type Review = {
    id: string;
    gig_id: string;
    reviewer_id: string;
    reviewee_id: string;
    rating: number;
    comment: string;
};
