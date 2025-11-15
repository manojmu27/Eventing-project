export enum UserRole {
    ADMIN = 'ADMIN',
    ORGANIZER = 'ORGANIZER',
    AUDIENCE = 'AUDIENCE'
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    name: string;
}

export enum EventStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected'
}

export interface Event {
    id: string;
    name: string;
    description: string;
    date: string; // YYYY-MM-DD
    day: string; // Monday, Tuesday, etc.
    time: string; // HH:mm
    venueId: string;
    posterUrl: string;
    capacity: number;
    organizerId: string;
    coordinatorName: string;
    clubName: string;
    status: EventStatus;
}

export interface Venue {
    id: string;
    name: string;
}

export interface Registration {
    id: string;
    eventId: string;
    userId: string;
    userName: string;
    userEmail: string;
}

export type Page = 
    | { name: 'home' }
    | { name: 'event-details'; id: string }
    | { name: 'create-event' }
    | { name: 'edit-event'; id: string }
    | { name: 'my-registrations' }
    | { name: 'calendar' };