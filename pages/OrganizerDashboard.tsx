import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useRouter } from '../contexts/RouterContext';
import EventCard from '../components/EventCard';
import Modal from '../components/Modal';
import { dbService } from '../services/dbService';
import { Registration, EventStatus, Event } from '../types';
import { Edit, Trash2, Eye, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const OrganizerDashboard: React.FC = () => {
    const { user } = useAuth();
    const { events, venues, users, registrations } = useData();
    const { navigate } = useRouter();
    const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false);
    const [selectedEventRegistrations, setSelectedEventRegistrations] = useState<Registration[]>([]);
    const [selectedEventName, setSelectedEventName] = useState('');
    
    const myEvents = useMemo(() => {
        if (!user) return [];
        return events.filter(e => e.organizerId === user.id);
    }, [events, user]);

    const pendingEvents = useMemo(() => {
        return myEvents
            .filter(e => e.status === EventStatus.PENDING)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [myEvents]);

    const approvedEvents = useMemo(() => {
        return myEvents
            .filter(e => e.status === EventStatus.APPROVED)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [myEvents]);

    const rejectedEvents = useMemo(() => {
        return myEvents
            .filter(e => e.status === EventStatus.REJECTED)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [myEvents]);

    const handleEdit = (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        navigate({ name: 'edit-event', id: eventId });
    };

    const handleDelete = async (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this event? This will also remove all registrations.')) {
            await dbService.deleteEvent(eventId);
        }
    };
    
    const handleViewRegistrations = async (e: React.MouseEvent, eventId: string, eventName: string) => {
        e.stopPropagation();
        const eventRegistrations = await dbService.getRegistrationsForEvent(eventId);
        setSelectedEventRegistrations(eventRegistrations);
        setSelectedEventName(eventName);
        setIsRegistrationsModalOpen(true);
    };

    const getVenue = (venueId: string) => venues.find(v => v.id === venueId);
    const getOrganizer = (organizerId: string) => users.find(u => u.id === organizerId);
    const getRegistrationsCount = (eventId: string) => registrations.filter(r => r.eventId === eventId).length;

    const EventGrid = ({ eventsToShow }: { eventsToShow: Event[] }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsToShow.map(event => (
                <div key={event.id} className="relative">
                    <EventCard
                        event={event}
                        venue={getVenue(event.venueId)}
                        organizer={getOrganizer(event.organizerId)}
                        registrationsCount={getRegistrationsCount(event.id)}
                        onClick={() => navigate({ name: 'event-details', id: event.id })}
                        userRole={user?.role}
                    />
                    <div className="absolute bottom-4 right-4 flex space-x-2 bg-black bg-opacity-30 p-1 rounded-lg">
                         <button onClick={(e) => handleViewRegistrations(e, event.id, event.name)} className="p-2 text-white hover:text-blue-300 transition" title="View Registrations"><Eye size={18}/></button>
                        <button onClick={(e) => handleEdit(e, event.id)} className="p-2 text-white hover:text-yellow-300 transition" title="Edit Event"><Edit size={18}/></button>
                        <button onClick={(e) => handleDelete(e, event.id)} className="p-2 text-white hover:text-red-300 transition" title="Delete Event"><Trash2 size={18}/></button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-brand-dark mb-6">My Organised Events</h1>
            
            {myEvents.length === 0 ? (
                <div className="text-center py-10 bg-brand-surface rounded-lg shadow">
                    <p className="text-gray-400">You haven't created any events yet.</p>
                    <button 
                        onClick={() => navigate({ name: 'create-event' })}
                        className="mt-4 bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Create Your First Event
                    </button>
                </div>
            ) : (
                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-semibold text-yellow-400 mb-4 flex items-center">
                            <AlertCircle className="mr-3"/>
                            Approval Pending Events
                        </h2>
                        {pendingEvents.length > 0 ? (
                            <EventGrid eventsToShow={pendingEvents} />
                        ) : (
                            <div className="text-center py-6 bg-brand-surface rounded-lg shadow-inner">
                                <p className="text-gray-400">No events are currently pending approval.</p>
                            </div>
                        )}
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-semibold text-green-400 mb-4 flex items-center">
                            <CheckCircle className="mr-3"/>
                            Approved Events
                        </h2>
                        {approvedEvents.length > 0 ? (
                            <EventGrid eventsToShow={approvedEvents} />
                        ) : (
                            <div className="text-center py-6 bg-brand-surface rounded-lg shadow-inner">
                                <p className="text-gray-400">You have no approved events.</p>
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-red-400 mb-4 flex items-center">
                            <XCircle className="mr-3"/>
                            Rejected Events
                        </h2>
                        {rejectedEvents.length > 0 ? (
                            <EventGrid eventsToShow={rejectedEvents} />
                        ) : (
                            <div className="text-center py-6 bg-brand-surface rounded-lg shadow-inner">
                                <p className="text-gray-400">You have no rejected events.</p>
                            </div>
                        )}
                    </section>
                </div>
            )}
            
            <Modal isOpen={isRegistrationsModalOpen} onClose={() => setIsRegistrationsModalOpen(false)} title={`Registrations for ${selectedEventName}`}>
                {selectedEventRegistrations.length > 0 ? (
                     <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedEventRegistrations.map(reg => (
                                    <tr key={reg.id} className="border-b border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-100">{reg.userName}</td>
                                        <td className="px-6 py-4">{reg.userEmail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No registrations yet.</p>
                )}
            </Modal>
        </div>
    );
};

export default OrganizerDashboard;