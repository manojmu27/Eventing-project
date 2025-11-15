
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { dbService } from '../services/dbService';
import { Event, Venue, Registration, User } from '../types';

interface DataContextType {
    events: Event[];
    venues: Venue[];
    registrations: Registration[];
    users: User[];
    loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const unsubscribeEvents = dbService.subscribe('events', (data) => setEvents(data as Event[]));
        const unsubscribeVenues = dbService.subscribe('venues', (data) => setVenues(data as Venue[]));
        const unsubscribeRegistrations = dbService.subscribe('registrations', (data) => setRegistrations(data as Registration[]));
        const unsubscribeUsers = dbService.subscribe('users', (data) => setUsers(data as User[]));
        
        // Initial fetch
        Promise.all([
            dbService.getEvents(),
            dbService.getVenues(),
            dbService.getRegistrations(),
            dbService.getUsers(),
        ]).then(([initialEvents, initialVenues, initialRegistrations, initialUsers]) => {
            setEvents(initialEvents);
            setVenues(initialVenues);
            setRegistrations(initialRegistrations);
            setUsers(initialUsers);
            setLoading(false);
        });

        return () => {
            unsubscribeEvents();
            unsubscribeVenues();
            unsubscribeRegistrations();
            unsubscribeUsers();
        };
    }, []);

    return (
        <DataContext.Provider value={{ events, venues, registrations, users, loading }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
   