import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
    id: number;
    username: string;
    email: string | null;
    displayName: string;
    profilePicture?: string | null;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, refreshToken: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Check valid session on load
    useEffect(() => {
        const initAuth = async () => {
            // ALWAYS BYPASS AUTH FOR DEVELOPMENT
            console.log("Bypassing auth for dev...");
            const devToken = 'dev-bypass-token';
            localStorage.setItem('accessToken', devToken);
            setUser({
                id: 1,
                username: 'jonah',
                email: 'jonahleifker@gmail.com',
                displayName: 'Jonah Leifker',
                roles: ['admin'] // Ensure dev user has admin roles if needed
            });
            setToken(devToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${devToken}`;
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (accessToken: string, refreshToken: string, userData: User) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userData.id.toString());
        setToken(accessToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
