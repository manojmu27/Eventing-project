import { User, UserRole } from '../types';
import { dbService } from './dbService';

export interface UserCredentials {
    email: string;
    password?: string;
}

const SESSION_KEY = 'eventing_cmrit_user';

class AuthService {
    async login(credentials: UserCredentials): Promise<User> {
        const { email, password } = credentials;

        // 1. Admin Login Check
        if (email.toLowerCase() === 'manojmuhustle@gmail.com') {
            if (password === 'Manueventing27@') {
                const adminUser = await dbService.findUserByEmail(email);
                if (!adminUser) throw new Error('Admin user not found in the database.');
                this.storeSession(adminUser);
                return adminUser;
            } else {
                throw new Error('Invalid admin credentials.');
            }
        }

        // 2. Domain check for non-admin users
        if (!email.toLowerCase().endsWith('@cmrit.ac.in')) {
            throw new Error('Only @cmrit.ac.in emails are allowed for students and organizers.');
        }
        
        // 3. Find existing user or create a new one
        let user = await dbService.findUserByEmail(email);

        if (!user) {
            // For this demo, create a new user on first login.
            const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const role = email.toLowerCase().includes('organizer') ? UserRole.ORGANIZER : UserRole.AUDIENCE;
            
            user = await dbService.createUser({
                email: email.toLowerCase(),
                name,
                role,
            });
        }
        
        this.storeSession(user);
        return user;
    }

    async logout(): Promise<void> {
        sessionStorage.removeItem(SESSION_KEY);
        return Promise.resolve();
    }

    async checkSession(): Promise<User | null> {
        const userJson = sessionStorage.getItem(SESSION_KEY);
        if (userJson) {
            try {
                const user: User = JSON.parse(userJson);
                // Verify user still exists in our 'DB'
                const freshUser = await dbService.findUserByEmail(user.email);
                if (freshUser) {
                    return Promise.resolve(freshUser);
                }
                // User from session doesn't exist anymore, clear it
                this.logout();
                return Promise.resolve(null);
            } catch (e) {
                // Invalid JSON in session, clear it
                this.logout();
                return Promise.resolve(null);
            }
        }
        return Promise.resolve(null);
    }
    
    private storeSession(user: User) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
}

export const authService = new AuthService();
