import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useRouter } from '../contexts/RouterContext';
import { dbService } from '../services/dbService';
import { EventStatus, Venue, Registration } from '../types';
import { Check, X, PlusCircle, Edit, Trash2, AlertTriangle, Users, BarChart2, MapPin, Eye } from 'lucide-react';
import Modal from '../components/Modal';
import EventCard from '../components/EventCard';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { events, venues, users, registrations } = useData();
    const { navigate } = useRouter();
    
    const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
    const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
    const [venueName, setVenueName] = useState('');
    const [error, setError] = useState('');

    const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false);
    const [selectedEventRegistrations, setSelectedEventRegistrations] = useState<Registration[]>([]);
    const [selectedEventName, setSelectedEventName] = useState('');

    const pendingEvents = useMemo(() => events.filter(e => e.status === EventStatus.PENDING), [events]);

    const myEvents = useMemo(() => {
        if (!user) return [];
        return events.filter(e => e.organizerId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [events, user]);

    const handleApprove = (id: string) => dbService.updateEventStatus(id, EventStatus.APPROVED);
    const handleReject = (id: string) => dbService.updateEventStatus(id, EventStatus.REJECTED);

    const handleVenueModalOpen = (venue: Venue | null = null) => {
        setEditingVenue(venue);
        setVenueName(venue?.name || '');
        setError('');
        setIsVenueModalOpen(true);
    };

    const handleVenueModalClose = () => {
        setIsVenueModalOpen(false);
        setEditingVenue(null);
        setVenueName('');
        setError('');
    };

    const handleVenueSubmit = async () => {
        if (!venueName.trim()) {
            setError('Venue name cannot be empty.');
            return;
        }
        try {
            if (editingVenue) {
                await dbService.updateVenue(editingVenue.id, venueName);
            } else {
                await dbService.addVenue(venueName);
            }
            handleVenueModalClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
    };
    
    const handleDeleteVenue = async (id: string) => {
        if(window.confirm('Are you sure you want to delete this venue? This cannot be undone.')){
            try {
                await dbService.deleteVenue(id);
            } catch (err) {
                alert(err instanceof Error ? err.message : 'An unknown error occurred.');
            }
        }
    }

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

    const getOrganizer = (organizerId: string) => users.find(u => u.id === organizerId);
    const getVenueName = (venueId: string) => venues.find(v => v.id === venueId)?.name || 'Unknown';
    const getVenue = (venueId: string) => venues.find(v => v.id === venueId);
    const getRegistrationsCount = (eventId: string) => registrations.filter(r => r.eventId === eventId).length;

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-brand-dark mb-6">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-brand-surface p-4 rounded-lg shadow flex items-center"><AlertTriangle className="text-yellow-500 mr-4" size={32}/><div><p className="text-3xl font-bold">{pendingEvents.length}</p><p className="text-gray-400">Pending Events</p></div></div>
                <div className="bg-brand-surface p-4 rounded-lg shadow flex items-center"><BarChart2 className="text-blue-500 mr-4" size={32}/><div><p className="text-3xl font-bold">{events.length}</p><p className="text-gray-400">Total Events</p></div></div>
                <div className="bg-brand-surface p-4 rounded-lg shadow flex items-center"><Users className="text-green-500 mr-4" size={32}/><div><p className="text-3xl font-bold">{users.length}</p><p className="text-gray-400">Total Users</p></div></div>
                <div className="bg-brand-surface p-4 rounded-lg shadow flex items-center"><MapPin className="text-pink-500 mr-4" size={32}/><div><p className="text-3xl font-bold">{venues.length}</p><p className="text-gray-400">Venues</p></div></div>
            </div>

            {/* Pending Events */}
            <div className="bg-brand-surface p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-100">Event Approval Requests</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Event</th>
                                <th scope="col" className="px-6 py-3">Organizer</th>
                                <th scope="col" className="px-6 py-3">Date & Time</th>
                                <th scope="col" className="px-6 py-3">Venue</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingEvents.length > 0 ? pendingEvents.map(event => (
                                <tr key={event.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-gray-100">{event.name}</td>
                                    <td className="px-6 py-4">{getOrganizer(event.organizerId)?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">{event.date} at {event.time}</td>
                                    <td className="px-6 py-4">{getVenueName(event.venueId)}</td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <button onClick={() => handleApprove(event.id)} className="p-2 text-green-400 hover:text-green-300 rounded-full hover:bg-green-900/50"><Check /></button>
                                        <button onClick={() => handleReject(event.id)} className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-red-900/50"><X /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="text-center py-4">No pending requests.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* My Created Events */}
            <div className="bg-brand-surface p-6 rounded-lg shadow mt-8">
                 <h2 className="text-2xl font-semibold mb-4 text-gray-100">My Created Events</h2>
                 {myEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myEvents.map(event => (
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
                ) : (
                    <p className="text-center text-gray-400 py-4">You haven't created any events yet.</p>
                )}
            </div>

            {/* Venue Management */}
            <div className="bg-brand-surface p-6 rounded-lg shadow mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-100">Manage Venues</h2>
                    <button onClick={() => handleVenueModalOpen()} className="flex items-center bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"><PlusCircle size={20} className="mr-2"/> Add Venue</button>
                </div>
                <ul className="space-y-2">
                    {venues.map(venue => (
                        <li key={venue.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                            <span>{venue.name}</span>
                            <div className="flex space-x-2">
                                <button onClick={() => handleVenueModalOpen(venue)} className="p-2 text-blue-400 hover:text-blue-300"><Edit size={18}/></button>
                                <button onClick={() => handleDeleteVenue(venue.id)} className="p-2 text-red-400 hover:text-red-300"><Trash2 size={18}/></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
             {/* TODO: Add sections for all events, users, and registrations */}
            
            <Modal isOpen={isVenueModalOpen} onClose={handleVenueModalClose} title={editingVenue ? 'Edit Venue' : 'Add Venue'}>
                <div className="space-y-4">
                    <label htmlFor="venueName" className="block text-sm font-medium text-gray-300">Venue Name</label>
                    <input
                        id="venueName"
                        type="text"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-gray-700 text-white"
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex justify-end space-x-2">
                        <button onClick={handleVenueModalClose} className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Cancel</button>
                        <button onClick={handleVenueSubmit} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-700">{editingVenue ? 'Save Changes' : 'Add Venue'}</button>
                    </div>
                </div>
            </Modal>

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

export default AdminDashboard;