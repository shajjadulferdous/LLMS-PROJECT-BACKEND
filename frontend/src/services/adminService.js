import api from './api';

export const adminService = {
    // User Management
    getAllUsers: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await api.get(`/users/admin/users?${params}`);
        return response.data;
    },

    blockUser: async (userId) => {
        const response = await api.post(`/users/admin/users/${userId}/block`);
        return response.data;
    },

    unblockUser: async (userId) => {
        const response = await api.post(`/users/admin/users/${userId}/unblock`);
        return response.data;
    },

    approveInstructor: async (userId) => {
        const response = await api.post(`/users/admin/users/${userId}/approve-instructor`);
        return response.data;
    },

    // Course Management
    getPendingCourses: async () => {
        const response = await api.get('/courses/admin/pending');
        return response.data;
    },

    approveCourse: async (courseId) => {
        const response = await api.post(`/courses/admin/${courseId}/approve`);
        return response.data;
    },

    denyCourse: async (courseId, reason) => {
        const response = await api.post(`/courses/admin/${courseId}/deny`, { reason });
        return response.data;
    },

    deleteCourse: async (courseId) => {
        const response = await api.delete(`/courses/admin/${courseId}`);
        return response.data;
    },

    // Analytics
    getSystemStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
};
