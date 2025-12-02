import GigForm from '@/components/GigForm';

export default function CreateGigPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Post a New Gig</h1>
                <p className="mt-2 text-gray-600">
                    Describe what you need help with, set a budget, and find a solver.
                </p>
            </div>
            <GigForm />
        </div>
    );
}
