import React from 'react';
import { Event, EventStatus, Venue, User, UserRole } from '../types';
import { Calendar, Clock, MapPin, Users, User as UserIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface EventCardProps {
    event: Event;
    venue?: Venue;
    organizer?: User;
    registrationsCount: number;
    onClick: () => void;
    userRole?: UserRole;
}

const EventCard: React.FC<EventCardProps> = ({ event, venue, organizer, registrationsCount, onClick, userRole }) => {

    const getStatusChip = (status: EventStatus) => {
        switch (status) {
            case EventStatus.APPROVED:
                return <div className="absolute top-2 right-2 flex items-center bg-green-900 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full"><CheckCircle size={14} className="mr-1"/> Approved</div>;
            case EventStatus.REJECTED:
                return <div className="absolute top-2 right-2 flex items-center bg-red-900 text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full"><XCircle size={14} className="mr-1"/> Rejected</div>;
            case EventStatus.PENDING:
                return <div className="absolute top-2 right-2 flex items-center bg-yellow-900 text-yellow-300 text-xs font-medium px-2.5 py-0.5 rounded-full"><AlertCircle size={14} className="mr-1"/> Pending</div>;
        }
    };
    
    const formattedDate = format(new Date(event.date.replace(/-/g, '/')), 'MMM dd, yyyy');
    const isPast = new Date(event.date) < new Date();

    return (
        <div onClick={onClick} className={`bg-brand-surface rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer ${isPast ? 'opacity-60' : ''}`}>
             <div className="relative bg-black">
                <img src={event.posterUrl} alt={event.name} className="w-full h-48 object-contain" />
                {(userRole === UserRole.ADMIN || userRole === UserRole.ORGANIZER) && getStatusChip(event.status)}
             </div>
            <div className="p-4">
                <h3 className="text-xl font-bold text-brand-dark mb-2 truncate">{event.name}</h3>
                
                <div className="space-y-2 text-gray-400 text-sm">
                    <div className="flex items-center">
                        <Calendar size={14} className="mr-2 text-brand-primary"/>
                        <span>{formattedDate} ({event.day})</span>
                    </div>
                    <div className="flex items-center">
                        <Clock size={14} className="mr-2 text-brand-primary"/>
                        <span>{event.time}</span>
                    </div>
                    <div className="flex items-center">
                        <MapPin size={14} className="mr-2 text-brand-primary"/>
                        <span className="truncate">{venue?.name || 'N/A'}</span>
                    </div>
                    {organizer && (
                         <div className="flex items-center">
                            <UserIcon size={14} className="mr-2 text-brand-primary"/>
                            <span className="truncate">By {organizer.name}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-sm">
                    <div className="flex items-center text-brand-secondary">
                        <Users size={16} className="mr-2"/>
                        <span>{registrationsCount} / {event.capacity} registered</span>
                    </div>
                    {isPast && <span className="text-xs font-semibold text-gray-400 bg-gray-700 px-2 py-1 rounded-full">PAST</span>}
                </div>
            </div>
        </div>
    );
};

export default EventCard;