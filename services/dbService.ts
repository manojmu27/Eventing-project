
import { Event, Venue, Registration, User, EventStatus, UserRole } from '../types';
import { format, getDay } from 'date-fns';

type Collection = 'users' | 'events' | 'venues' | 'registrations';
type Listener = (data: any[]) => void;

class MockDBService {
    private users: User[] = [];
    private events: Event[] = [];
    private venues: Venue[] = [];
    private registrations: Registration[] = [];
    private listeners: Map<Collection, Set<Listener>> = new Map();

    constructor() {
        this.seedData();
        this.listeners.set('users', new Set());
        this.listeners.set('events', new Set());
        this.listeners.set('venues', new Set());
        this.listeners.set('registrations', new Set());
    }
    
    private notify(collection: Collection) {
        const data = this.getData(collection);
        this.listeners.get(collection)?.forEach(listener => listener([...data]));
    }

    private getData(collection: Collection) {
        switch(collection) {
            case 'users': return this.users;
            case 'events': return this.events;
            case 'venues': return this.venues;
            case 'registrations': return this.registrations;
        }
    }

    subscribe(collection: Collection, listener: Listener): () => void {
        this.listeners.get(collection)?.add(listener);
        return () => this.listeners.get(collection)?.delete(listener);
    }
    
    private seedData() {
        // Users
        this.users = [
            { id: '1', email: 'manojmuhustle@gmail.com', name: 'Manoj M', role: UserRole.ADMIN },
            { id: '2', email: 'organizer@cmrit.ac.in', name: 'IEEE Club', role: UserRole.ORGANIZER },
            { id: '3', email: 'student1@cmrit.ac.in', name: 'Alice Smith', role: UserRole.AUDIENCE },
            { id: '4', email: 'student2@cmrit.ac.in', name: 'Bob Johnson', role: UserRole.AUDIENCE },
            { id: '5', email: 'organizer2@cmrit.ac.in', name: 'CSI Club', role: UserRole.ORGANIZER },
        ];
        
        // Venues
        this.venues = [
            { id: 'v1', name: 'Seminar Hall' },
            { id: 'v2', name: 'Auditorium' },
            { id: 'v3', name: 'Classroom-A' },
            { id: 'v4', name: 'OAT (Open Air Theatre)' },
            { id: 'v5', name: 'Quadrangle'},
        ];

        // Events
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        this.events = [
            { id: 'e1', name: 'Tech Fest 2024', description: 'Join us for the annual tech extravaganza featuring coding competitions, robotics workshops, and guest lectures from industry experts.', coordinatorName: 'Dr. Anitha S', clubName: 'IEEE Student Branch', date: format(tomorrow, 'yyyy-MM-dd'), day: format(tomorrow, 'EEEE'), time: '10:00', venueId: 'v2', posterUrl: 'https://picsum.photos/seed/techfest/800/600', capacity: 200, organizerId: '2', status: EventStatus.APPROVED },
            { id: 'e2', name: 'Annual Sports Day', description: 'Get ready for a day of thrilling athletic events, team spirit, and fun. Participate in track and field, volleyball, and more!', coordinatorName: 'Mr. Ravi Verma', clubName: 'Sports Committee', date: format(nextWeek, 'yyyy-MM-dd'), day: format(nextWeek, 'EEEE'), time: '09:00', venueId: 'v4', posterUrl: 'https://picsum.photos/seed/sports/800/600', capacity: 500, organizerId: '2', status: EventStatus.APPROVED },
            { id: 'e3', name: 'Workshop on AI', description: 'A hands-on workshop covering the fundamentals of Artificial Intelligence and Machine Learning. Laptops are mandatory.', coordinatorName: 'Prof. Priya K', clubName: 'CSI Student Chapter', date: format(today, 'yyyy-MM-dd'), day: format(today, 'EEEE'), time: '14:00', venueId: 'v1', posterUrl: 'https://picsum.photos/seed/ai/800/600', capacity: 50, organizerId: '5', status: EventStatus.PENDING },
            { id: 'e4', name: 'Cultural Night', description: 'An evening celebrating the diverse talents of our students. Enjoy music, dance, drama, and stand-up comedy.', coordinatorName: 'Ms. Sneha Reddy', clubName: 'Cultural Club', date: format(yesterday, 'yyyy-MM-dd'), day: format(yesterday, 'EEEE'), time: '18:00', venueId: 'v2', posterUrl: 'https://picsum.photos/seed/cultural/800/600', capacity: 300, organizerId: '5', status: EventStatus.APPROVED },
            { id: 'e5', name: 'Guest Lecture: Blockchain', description: 'Explore the world of blockchain technology and cryptocurrencies with an industry leader. Learn about its impact and future potential.', coordinatorName: 'Dr. John Doe', clubName: 'Fintech Club', date: format(nextWeek, 'yyyy-MM-dd'), day: format(nextWeek, 'EEEE'), time: '11:00', venueId: 'v1', posterUrl: 'https://picsum.photos/seed/blockchain/800/600', capacity: 100, organizerId: '2', status: EventStatus.REJECTED },
        ];
        
        // Registrations
        this.registrations = [
            { id: 'r1', eventId: 'e1', userId: '3', userName: 'Alice Smith', userEmail: 'student1@cmrit.ac.in' },
            { id: 'r2', eventId: 'e1', userId: '4', userName: 'Bob Johnson', userEmail: 'student2@cmrit.ac.in' },
            { id: 'r3', eventId: 'e4', userId: '3', userName: 'Alice Smith', userEmail: 'student1@cmrit.ac.in' },
        ];
    }
    
    private simulateLatency = <T,>(data: T): Promise<T> => new Promise(res => setTimeout(() => res(data), 200));

    // USERS
    getUsers = () => this.simulateLatency(this.users);
    findUserByEmail = (email: string) => this.simulateLatency(this.users.find(u => u.email.toLowerCase() === email.toLowerCase()));
    createUser = (userData: Omit<User, 'id'>) => {
        const newUser: User = {
            ...userData,
            id: `u${Date.now()}`
        };
        this.users.push(newUser);
        this.notify('users');
        return this.simulateLatency(newUser);
    }

    // VENUES
    getVenues = () => this.simulateLatency(this.venues);
    addVenue = (name: string) => {
        const newVenue: Venue = { id: `v${Date.now()}`, name };
        this.venues.push(newVenue);
        this.notify('venues');
        return this.simulateLatency(newVenue);
    }
    updateVenue = (id: string, name: string) => {
        const venue = this.venues.find(v => v.id === id);
        if (venue) {
            venue.name = name;
            this.notify('venues');
            return this.simulateLatency(venue);
        }
        return Promise.reject(new Error('Venue not found'));
    }
    deleteVenue = (id: string) => {
        const isUsed = this.events.some(e => e.venueId === id);
        if (isUsed) return Promise.reject(new Error('Venue is in use by an event and cannot be deleted.'));
        this.venues = this.venues.filter(v => v.id !== id);
        this.notify('venues');
        return this.simulateLatency(true);
    }


    // EVENTS
    getEvents = () => this.simulateLatency(this.events);
    isSlotBooked = (date: string, time: string, venueId: string, excludeEventId?: string) => {
        return this.events.some(e =>
            e.id !== excludeEventId &&
            e.date === date &&
            e.time === time &&
            e.venueId === venueId
        );
    }
    createEvent = (eventData: Omit<Event, 'id' | 'status' | 'day'>) => {
        if (this.isSlotBooked(eventData.date, eventData.time, eventData.venueId)) {
            return Promise.reject(new Error('This slot is already booked. Please choose a different date/time/venue.'));
        }

        const organizer = this.users.find(u => u.id === eventData.organizerId);
        const status = organizer?.role === UserRole.ADMIN ? EventStatus.APPROVED : EventStatus.PENDING;

        const newEvent: Event = {
            ...eventData,
            id: `e${Date.now()}`,
            day: format(new Date(eventData.date.replace(/-/g, '/')), 'EEEE'), // Fix for date parsing
            status,
        };
        this.events.push(newEvent);
        this.notify('events');
        return this.simulateLatency(newEvent);
    }
    updateEvent = (id: string, eventData: Partial<Omit<Event, 'id'>>) => {
        const eventIndex = this.events.findIndex(e => e.id === id);
        if (eventIndex === -1) return Promise.reject(new Error('Event not found'));

        const existingEvent = this.events[eventIndex];
        const updatedData = { ...existingEvent, ...eventData };

        if (eventData.date || eventData.time || eventData.venueId) {
             if (this.isSlotBooked(updatedData.date, updatedData.time, updatedData.venueId, id)) {
                return Promise.reject(new Error('This slot is already booked. Please choose a different date/time/venue.'));
             }
        }
        
        if(eventData.date) {
            updatedData.day = format(new Date(eventData.date.replace(/-/g, '/')), 'EEEE');
        }

        this.events[eventIndex] = { ...this.events[eventIndex], ...updatedData };
        this.notify('events');
        return this.simulateLatency(this.events[eventIndex]);
    }
    deleteEvent = (id: string) => {
        this.events = this.events.filter(e => e.id !== id);
        this.registrations = this.registrations.filter(r => r.eventId !== id);
        this.notify('events');
        this.notify('registrations');
        return this.simulateLatency(true);
    }
    updateEventStatus = (id: string, status: EventStatus) => {
        const event = this.events.find(e => e.id === id);
        if (event) {
            event.status = status;
            this.notify('events');
            return this.simulateLatency(event);
        }
        return Promise.reject(new Error('Event not found'));
    }

    // REGISTRATIONS
    getRegistrations = () => this.simulateLatency(this.registrations);
    getRegistrationsForEvent = (eventId: string) => this.simulateLatency(this.registrations.filter(r => r.eventId === eventId));
    registerForEvent = (eventId: string, userId: string, userName: string, userEmail: string) => {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return Promise.reject(new Error('Event not found'));

        const registrationsForEvent = this.registrations.filter(r => r.eventId === eventId);
        if (registrationsForEvent.length >= event.capacity) {
            return Promise.reject(new Error('Event is full.'));
        }
        if (registrationsForEvent.some(r => r.userId === userId)) {
            return Promise.reject(new Error('Already registered.'));
        }

        const newRegistration: Registration = {
            id: `r${Date.now()}`,
            eventId,
            userId,
            userName,
            userEmail,
        };
        this.registrations.push(newRegistration);
        this.notify('registrations');
        return this.simulateLatency(newRegistration);
    }
    cancelRegistration = (eventId: string, userId: string) => {
        this.registrations = this.registrations.filter(r => !(r.eventId === eventId && r.userId === userId));
        this.notify('registrations');
        return this.simulateLatency(true);
    }
}

export const dbService = new MockDBService();