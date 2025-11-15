import React, { useMemo } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { ArrowLeft, Calendar, Clock, MapPin, Users, User as UserIcon, CheckCircle, Ticket, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

interface EventDetailsPageProps {
    eventId: string;
}

const EventDetailsPage: React.FC<EventDetailsPageProps> = ({ eventId }) => {
    const { navigate } = useRouter();
    const { user } = useAuth();
    const { events, venues, users, registrations } = useData();

    const event = useMemo(() => events.find(e => e.id === eventId), [events, eventId]);
    const venue = useMemo(() => event ? venues.find(v => v.id === event.venueId) : undefined, [venues, event]);
    const organizer = useMemo(() => event ? users.find(u => u.id === event.organizerId) : undefined, [users, event]);
    const registrationsForEvent = useMemo(() => registrations.filter(r => r.eventId === eventId), [registrations, eventId]);

    const isRegistered = useMemo(() => {
        if (!user) return false;
        return registrationsForEvent.some(r => r.userId === user.id);
    }, [registrationsForEvent, user]);
    
    const isFull = useMemo(() => {
        if (!event) return false;
        return registrationsForEvent.length >= event.capacity;
    }, [registrationsForEvent, event]);

    const isPast = event ? new Date(event.date.replace(/-/g, '/')) < new Date(format(new Date(), 'yyyy-MM-dd')) : false;

    const handleRegister = async () => {
        if (!user || !event) return;
        try {
            await dbService.registerForEvent(event.id, user.id, user.name, user.email);
            alert('Successfully registered!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Registration failed.');
        }
    };
    
    const handleCancelRegistration = async () => {
        if (!user || !event) return;
        try {
            await dbService.cancelRegistration(event.id, user.id);
            alert('Registration cancelled.');
        } catch(err) {
            alert(err instanceof Error ? err.message : 'Cancellation failed.');
        }
    }


    if (!event) {
        return <div className="text-center p-10">Event not found.</div>;
    }

    const formattedDate = format(new Date(event.date.replace(/-/g, '/')), 'EEEE, MMMM dd, yyyy');

    return (
        <div className="container mx-auto max-w-4xl">
            <button onClick={() => navigate({name: 'home'})} className="flex items-center text-brand-primary mb-4 hover:underline">
                <ArrowLeft size={20} className="mr-2"/> Back to Events
            </button>
            <div className="bg-brand-surface rounded-lg shadow-xl overflow-hidden">
                <div className="w-full h-64 md:h-96 bg-black flex justify-center items-center">
                    <img src={event.posterUrl} alt={event.name} className="w-full h-full object-contain" />
                </div>
                <div className="p-6 md:p-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2">{event.name}</h1>
                    <p className="text-gray-400 mb-6">{event.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300 mb-6">
                        <div className="flex items-start"><Calendar size={20} className="text-brand-primary mt-1 mr-3 flex-shrink-0"/><div><p className="font-semibold">Date & Day</p><p>{formattedDate}</p></div></div>
                        <div className="flex items-start"><Clock size={20} className="text-brand-primary mt-1 mr-3 flex-shrink-0"/><div><p className="font-semibold">Time</p><p>{event.time}</p></div></div>
                        <div className="flex items-start"><MapPin size={20} className="text-brand-primary mt-1 mr-3 flex-shrink-0"/><div><p className="font-semibold">Venue</p><p>{venue?.name}</p></div></div>
                        <div className="flex items-start"><UserIcon size={20} className="text-brand-primary mt-1 mr-3 flex-shrink-0"/><div><p className="font-semibold">Event Coordinator</p><p>{event.coordinatorName}</p></div></div>
                        <div className="flex items-start"><Users size={20} className="text-brand-primary mt-1 mr-3 flex-shrink-0"/><div><p className="font-semibold">Conducting Club</p><p>{event.clubName}</p></div></div>
                        <div className="flex items-start"><Briefcase size={20} className="text-brand-primary mt-1 mr-3 flex-shrink-0"/><div><p className="font-semibold">Posted By</p><p>{organizer?.name}</p></div></div>
                    </div>

                    <div className="flex items-center bg-blue-900/50 p-4 rounded-lg">
                        <Users size={24} className="text-brand-primary mr-4"/>
                        <div>
                            <p className="font-semibold text-gray-100">Registrations</p>
                            <p className="text-lg">{registrationsForEvent.length} / {event.capacity}</p>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                       { isPast ? (
                           <div className="text-center p-4 bg-gray-700 text-gray-400 rounded-lg">This event has already passed.</div>
                       ) : isRegistered ? (
                            <div className="text-center">
                                <p className="text-green-400 font-semibold flex items-center justify-center"><CheckCircle size={20} className="mr-2"/> You are registered for this event.</p>
                                <button onClick={handleCancelRegistration} className="mt-2 text-sm text-red-400 hover:underline">Cancel Registration</button>
                            </div>
                        ) : isFull ? (
                            <div className="text-center p-4 bg-red-900/50 text-red-400 rounded-lg">Registration is full.</div>
                        ) : (
                            <button 
                                onClick={handleRegister}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-brand-secondary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary"
                            >
                                <Ticket size={22} className="mr-2" /> Register Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;