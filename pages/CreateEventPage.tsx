import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useRouter } from '../contexts/RouterContext';
import { dbService } from '../services/dbService';
import { ArrowLeft, Upload } from 'lucide-react';

interface CreateEventPageProps {
    eventId?: string;
}

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const CreateEventPage: React.FC<CreateEventPageProps> = ({ eventId }) => {
    const { user } = useAuth();
    const { venues, events } = useData();
    const { navigate } = useRouter();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coordinatorName, setCoordinatorName] = useState('');
    const [clubName, setClubName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [venueId, setVenueId] = useState('');
    const [capacity, setCapacity] = useState(100);
    const [posterUrl, setPosterUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const isEditing = Boolean(eventId);

    useEffect(() => {
        if (isEditing) {
            const eventToEdit = events.find(e => e.id === eventId);
            if (eventToEdit) {
                setName(eventToEdit.name);
                setDescription(eventToEdit.description);
                setCoordinatorName(eventToEdit.coordinatorName);
                setClubName(eventToEdit.clubName);
                setDate(eventToEdit.date);
                setTime(eventToEdit.time);
                setVenueId(eventToEdit.venueId);
                setCapacity(eventToEdit.capacity);
                setPosterUrl(eventToEdit.posterUrl);
            }
        }
    }, [isEditing, eventId, events]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const base64 = await fileToBase64(file);
                setPosterUrl(base64);
            } catch (error) {
                console.error("Error converting file to base64", error);
                setError("Could not process the image file.");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to create an event.');
            return;
        }
        if (!name || !date || !time || !venueId || !capacity || !description || !coordinatorName || !clubName) {
            setError('Please fill out all fields.');
            return;
        }
        if (!posterUrl) {
            setError('Please provide an event poster.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const eventData = {
                name,
                description,
                coordinatorName,
                clubName,
                date,
                time,
                venueId,
                capacity: Number(capacity),
                posterUrl,
            };

            if (isEditing) {
                await dbService.updateEvent(eventId, eventData);
            } else {
                await dbService.createEvent({ ...eventData, organizerId: user.id });
            }
            navigate({ name: 'home' });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl">
            <button onClick={() => navigate({name: 'home'})} className="flex items-center text-brand-primary mb-4 hover:underline">
                <ArrowLeft size={20} className="mr-2"/> Back to Dashboard
            </button>
            <div className="bg-brand-surface p-8 rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold text-brand-dark mb-6">{isEditing ? 'Edit Event' : 'Create a New Event'}</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Event Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-gray-700 text-white" />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300">Event Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-gray-700 text-white"></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="coordinatorName" className="block text-sm font-medium text-gray-300">Coordinator Name</label>
                            <input type="text" id="coordinatorName" value={coordinatorName} onChange={e => setCoordinatorName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-gray-700 text-white" />
                        </div>
                        <div>
                            <label htmlFor="clubName" className="block text-sm font-medium text-gray-300">Club / Department</label>
                            <input type="text" id="clubName" value={clubName} onChange={e => setClubName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-gray-700 text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-gray-700 text-white" />
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-300">Time</label>
                            <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-gray-700 text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="venue" className="block text-sm font-medium text-gray-300">Venue</label>
                            <select id="venue" value={venueId} onChange={e => setVenueId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-gray-700 text-white">
                                <option value="" disabled>Select a venue</option>
                                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-300">Capacity</label>
                            <input type="number" id="capacity" value={capacity} onChange={e => setCapacity(parseInt(e.target.value, 10))} min="1" required className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-gray-700 text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Event Poster</label>
                        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {posterUrl ? (
                                    <img src={posterUrl} alt="Poster preview" className="mx-auto h-48 w-auto rounded-md" />
                                ) : (
                                    <Upload className="mx-auto h-12 w-12 text-gray-500" />
                                )}
                                <div className="flex text-sm text-gray-400 justify-center">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-brand-primary hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-brand-primary px-3 py-1">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-primary disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Event')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventPage;