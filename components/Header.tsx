import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { UserRole } from '../types';
import { LogOut, Home, CalendarPlus, UserCheck, Calendar } from 'lucide-react';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const { navigate } = useRouter();

    if (!user) return null;

    return (
        <header className="bg-brand-surface text-white shadow-lg border-b border-gray-800">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div 
                    className="text-2xl font-bold tracking-wider cursor-pointer text-brand-primary"
                    onClick={() => navigate({ name: 'home' })}
                >
                    Eventing CMRIT
                </div>
                <div className="flex items-center space-x-4">
                    <span className="hidden md:inline">Welcome, {user.name.split(' ')[0]}!</span>
                    <nav className="flex items-center space-x-2 md:space-x-4">
                        <button onClick={() => navigate({ name: 'home' })} className="hover:bg-gray-700 p-2 rounded-full transition-colors" title="Home"><Home size={20} /></button>
                        <button onClick={() => navigate({ name: 'calendar' })} className="hover:bg-gray-700 p-2 rounded-full transition-colors" title="Event Calendar"><Calendar size={20} /></button>
                        {(user.role === UserRole.ORGANIZER || user.role === UserRole.ADMIN || user.role === UserRole.AUDIENCE) && (
                            <button onClick={() => navigate({ name: 'create-event' })} className="hover:bg-gray-700 p-2 rounded-full transition-colors" title="Create Event"><CalendarPlus size={20} /></button>
                        )}
                        {user.role === UserRole.AUDIENCE && (
                            <button onClick={() => navigate({ name: 'my-registrations' })} className="hover:bg-gray-700 p-2 rounded-full transition-colors" title="My Registrations"><UserCheck size={20} /></button>
                        )}
                        <button onClick={logout} className="bg-brand-secondary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors" title="Logout">
                            <LogOut size={20} />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;