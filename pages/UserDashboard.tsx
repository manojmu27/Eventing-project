import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useRouter } from '../contexts/RouterContext';
import { Event, EventStatus } from '../types';
import EventCard from '../components/EventCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const UserDashboard: React.FC = () => {
    const { events, venues, users, registrations } = useData();
    const { navigate } = useRouter();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const approvedEvents = useMemo(() => events.filter(e => e.status === EventStatus.APPROVED), [events]);

    const eventsByDate = useMemo(() => {
        return approvedEvents.reduce((acc, event) => {
            const date = event.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(event);
            return acc;
        }, {} as Record<string, Event[]>);
    }, [approvedEvents]);

    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });
    const startingDayIndex = getDay(start);

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const getVenue = (venueId: string) => venues.find(v => v.id === venueId);
    const getOrganizer = (organizerId: string) => users.find(u => u.id === organizerId);
    const getRegistrationsCount = (eventId: string) => registrations.filter(r => r.eventId === eventId).length;

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-brand-dark mb-6">Event Calendar</h1>
            
            <div className="bg-brand-surface p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft /></button>
                    <h2 className="text-xl font-semibold text-gray-100">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight /></button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400">
                    {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} className="h-28"></div>)}
                    {daysInMonth.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayEvents = eventsByDate[dateStr] || [];
                        return (
                            <div key={dateStr} className={`border border-gray-800 rounded-md h-32 p-1 overflow-y-auto transition-colors ${!isSameMonth(day, currentMonth) ? 'bg-black/20' : ''} ${isToday(day) ? 'bg-blue-900/50 border-brand-primary' : 'hover:bg-gray-800'}`}>
                                <div className={`text-xs text-center font-bold ${isToday(day) ? 'text-brand-primary' : 'text-gray-400'}`}>{format(day, 'd')}</div>
                                {dayEvents.map(event => (
                                    <div 
                                        key={event.id} 
                                        onClick={() => navigate({ name: 'event-details', id: event.id })}
                                        className="text-xs bg-brand-primary text-white rounded px-1 py-0.5 mt-1 truncate cursor-pointer hover:bg-blue-700"
                                    >
                                        {event.name}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            <h2 className="text-2xl font-bold text-brand-dark my-8">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedEvents
                    .filter(event => new Date(event.date.replace(/-/g, '/')) >= new Date(format(new Date(), 'yyyy-MM-dd')))
                    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(event => (
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
        </div>
    );
};

export default UserDashboard;