
import React, { createContext, useContext } from 'react';
import { Page } from '../types';

interface RouterContextType {
    page: Page;
    navigate: (page: Page) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider = RouterContext.Provider;

export const useRouter = (): RouterContextType => {
    const context = useContext(RouterContext);
    if (context === undefined) {
        throw new Error('useRouter must be used within a RouterProvider');
    }
    return context;
};
   