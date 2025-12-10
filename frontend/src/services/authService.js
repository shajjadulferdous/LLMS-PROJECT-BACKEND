import api from './api';

export const authService = {
    register: async (formData) => {
        const response = await api.post('/users/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/users/login', credentials);
        console.log('Auth service login response:', response);
        console.log('Response data:', response.data);

        // Backend ApiResponse structure: { statusCode, data: user, message }
        // response.data.data contains the user object with accessToken
        const userData = response.data.data || response.data;

        // Store accessToken if present
        if (userData.accessToken) {
            console.log('Storing accessToken in localStorage');
            localStorage.setItem('accessToken', userData.accessToken);
        }

        return response.data; // Return full ApiResponse
    },

    logout: async () => {
        const response = await api.post('/users/logout');
        localStorage.removeItem('accessToken');
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.patch('/users/profile', data);
        return response.data;
    },

    updateProfilePicture: async (formData) => {
        const response = await api.post('/users/profile/picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    changePassword: async (data) => {
        const response = await api.post('/users/passwordchange', data);
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/users/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await api.post(`/users/reset-password/${token}`, { password });
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/users/refresh');
        return response.data;
    },
};
