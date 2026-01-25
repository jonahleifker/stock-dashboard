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
            // Check for dev bypass flag
            const devBypass = process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEV_BYPASS === 'true';
            
            if (devBypass) {
                console.log("Dev bypass enabled - auto-authenticating as test user");
                const devToken = 'dev-bypass-token';
                localStorage.setItem('accessToken', devToken);
                setUser({
                    id: 1,
                    username: 'jonah',
                    email: 'jonahleifker@gmail.com',
                    displayName: 'Jonah Leifker',
                    roles: ['admin']
                });
                setToken(devToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${devToken}`;
                setLoading(false);
                return;
            }

            // Normal authentication flow
            const storedToken = localStorage.getItem('accessToken');
            
            if (!storedToken) {
                // No token, user is not authenticated
                setLoading(false);
                return;
            }

            try {
                // Validate token by calling /api/auth/me
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                const response = await axios.get('/api/auth/me', {
                    timeout: 5000 // 5 second timeout
                });
                
                if (response.data.user) {
                    // Token is valid, set user
                    setUser(response.data.user);
                    setToken(storedToken);
                } else {
                    throw new Error('Invalid user data');
                }
            } catch (error: any) {
                console.log('Token validation failed:', error.message);
                
                // Try to refresh the token
                const refreshToken = localStorage.getItem('refreshToken');
                const userId = localStorage.getItem('userId');
                
                if (refreshToken && userId) {
                    try {
                        console.log('Attempting token refresh...');
                        const refreshResponse = await axios.post('/api/auth/refresh', {
                            userId: parseInt(userId),
                            refreshToken
                        }, {
                            timeout: 5000
                        });
                        
                        // Refresh successful
                        const newAccessToken = refreshResponse.data.accessToken;
                        const newRefreshToken = refreshResponse.data.refreshToken;
                        
                        localStorage.setItem('accessToken', newAccessToken);
                        localStorage.setItem('refreshToken', newRefreshToken);
                        
                        // Fetch user data with new token
                        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                        const userResponse = await axios.get('/api/auth/me', {
                            timeout: 5000
                        });
                        
                        setUser(userResponse.data.user);
                        setToken(newAccessToken);
                        console.log('Token refresh successful');
                    } catch (refreshError: any) {
                        console.log('Refresh failed:', refreshError.message, '- clearing session');
                        // Refresh failed, clear everything
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                        delete axios.defaults.headers.common['Authorization'];
                        setUser(null);
                        setToken(null);
                    }
                } else {
                    // No refresh token, clear invalid access token
                    console.log('No refresh token available, clearing session');
                    localStorage.removeItem('accessToken');
                    delete axios.defaults.headers.common['Authorization'];
                    setUser(null);
                    setToken(null);
                }
            } finally {
                // Always set loading to false, even if there's an error
                setLoading(false);
            }
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
