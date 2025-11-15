import React, { useState, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import UserDashboard from './pages/UserDashboard';
import Header from './components/Header';
import { RouterProvider } from './contexts/RouterContext';
import EventDetailsPage from './pages/EventDetailsPage';
import CreateEventPage from './pages/CreateEventPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import { Page, UserRole } from './types';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <DataProvider>
                <AppContent />
            </DataProvider>
        </AuthProvider>
    );
};

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const { events } = useData();
    const [page, setPage] = useState<Page>({ name: 'home' });

    const navigate = useCallback((page: Page) => {
        setPage(page);
    }, []);

    const routerContextValue = useMemo(() => ({ page, navigate }), [page, navigate]);

    const hasOrganizedEvents = useMemo(() => {
        if (!user) return false;
        return events.some(e => e.organizerId === user.id);
    }, [events, user]);

    const renderPage = () => {
        if (loading) {
            return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-primary"></div></div>;
        }

        if (!user) {
            return <LoginPage />;
        }

        const dashboardToShow = () => {
            switch(user.role) {
                case UserRole.ADMIN:
                    return <AdminDashboard />;
                case UserRole.ORGANIZER:
                    return <OrganizerDashboard />;
                case UserRole.AUDIENCE:
                    return hasOrganizedEvents ? <OrganizerDashboard /> : <UserDashboard />;
                default:
                    return <UserDashboard />;
            }
        };

        return (
            <div className="min-h-screen">
                <Header />
                <main className="p-4 md:p-8">
                    {page.name === 'home' && dashboardToShow()}
                    {page.name === 'event-details' && <EventDetailsPage eventId={page.id} />}
                    {page.name === 'create-event' && <CreateEventPage />}
                    {page.name === 'edit-event' && <CreateEventPage eventId={page.id} />}
                    {page.name === 'my-registrations' && <MyRegistrationsPage />}
                    {page.name === 'calendar' && <UserDashboard />}
                </main>
            </div>
        );
    };

    return (
        <RouterProvider value={routerContextValue}>
            {renderPage()}
        </RouterProvider>
    );
};

export default App;