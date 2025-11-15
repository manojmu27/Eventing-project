import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { authService, UserCredentials } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: UserCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            setLoading(true);
            try {
                const sessionUser = await authService.checkSession();
                setUser(sessionUser);
            } catch (error) {
                console.error("Failed to check session:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = useCallback(async (credentials: UserCredentials) => {
        const loggedInUser = await authService.login(credentials);
        setUser(loggedInUser);
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
