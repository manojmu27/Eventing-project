import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useRouter } from '../contexts/RouterContext';
import EventCard from '../components/EventCard';
import { ArrowLeft } from 'lucide-react';

const MyRegistrationsPage: React.FC = () => {
    const { user } = useAuth();
    const { events, venues, registrations, users } = useData();
    const { navigate } = useRouter();

    const myRegisteredEvents = useMemo(() => {
        if (!user) return [];
        const myRegistrationEventIds = new Set(registrations.filter(r => r.userId === user.id).map(r => r.eventId));
        return events.filter(e => myRegistrationEventIds.has(e.id));
    }, [user, registrations, events]);

    const upcomingEvents = useMemo(() => {
        return myRegisteredEvents
            .filter(e => new Date(e.date.replace(/-/g, '/')) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [myRegisteredEvents]);

    const pastEvents = useMemo(() => {
        return myRegisteredEvents
            .filter(e => new Date(e.date.replace(/-/g, '/')) < new Date())
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [myRegisteredEvents]);
    
    const getVenue = (venueId: string) => venues.find(v => v.id === venueId);
    const getOrganizer = (organizerId: string) => users.find(u => u.id === organizerId);
    const getRegistrationsCount = (eventId: string) => registrations.filter(r => r.eventId === eventId).length;

    return (
        <div className="container mx-auto">
             <button onClick={() => navigate({name: 'home'})} className="flex items-center text-brand-primary mb-4 hover:underline">
                <ArrowLeft size={20} className="mr-2"/> Back to Calendar
            </button>
            <h1 className="text-3xl font-bold text-brand-dark mb-6">My Registered Events</h1>

            <section>
                <h2 className="text-2xl font-semibold text-brand-dark mb-4">Upcoming Events</h2>
                {upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                venue={getVenue(event.venueId)}
                                organizer={getOrganizer(event.organizerId)}
                                registrationsCount={getRegistrationsCount(event.id)}
                                onClick={() => navigate({ name: 'event-details', id: event.id })}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-brand-surface rounded-lg shadow">
                         <p className="text-gray-400">You have no upcoming registered events.</p>
                    </div>
                )}
            </section>
            
            <section className="mt-12">
                <h2 className="text-2xl font-semibold text-brand-dark mb-4">Past Events</h2>
                 {pastEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastEvents.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                venue={getVenue(event.venueId)}
                                organizer={getOrganizer(event.organizerId)}
                                registrationsCount={getRegistrationsCount(event.id)}
                                onClick={() => navigate({ name: 'event-details', id: event.id })}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-brand-surface rounded-lg shadow">
                         <p className="text-gray-400">No past registered events to show.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default MyRegistrationsPage;