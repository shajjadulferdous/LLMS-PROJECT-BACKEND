import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                console.log('Checking authentication with token...');
                const response = await authService.getCurrentUser();
                console.log('getCurrentUser response:', response);
                // ApiResponse structure: { statusCode, data: user, message }
                const userData = response.data || response;
                console.log('Setting user from checkAuth:', userData);
                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('accessToken');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            console.log('Login attempt with:', credentials.email || credentials.username);
            const response = await authService.login(credentials);
            console.log('Login response:', response);
            console.log('Response.data:', response.data);

            // Backend ApiResponse structure: { statusCode, data: user, message }
            // Axios response.data contains the ApiResponse
            const userData = response.data.data || response.data;
            console.log('User data extracted:', userData);

            setUser(userData);
            setIsAuthenticated(true);
            toast.success('Login successful!');
            return { user: userData }; // Return in expected format for Login component
        } catch (error) {
            console.error('Login error in context:', error);
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            // Don't show toast here - let the component handle it
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if API call fails
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
