import api from './api';

export const courseService = {
    getAllCourses: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await api.get(`/courses?${params}`);
        return response.data;
    },

    getCourseById: async (id) => {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    },

    createCourse: async (courseData) => {
        const response = await api.post('/courses', courseData);
        return response.data;
    },

    updateCourse: async (id, courseData) => {
        const response = await api.patch(`/courses/${id}`, courseData);
        return response.data;
    },

    deleteCourse: async (id) => {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    },

    addMaterial: async (courseId, materialData) => {
        const response = await api.post(`/courses/${courseId}/materials`, materialData);
        return response.data;
    },

    deleteMaterial: async (courseId, materialId) => {
        const response = await api.delete(`/courses/${courseId}/materials/${materialId}`);
        return response.data;
    },

    searchInstructors: async (query) => {
        const response = await api.get(`/courses/search/instructors?q=${query}`);
        return response.data;
    },

    // Student - Quiz submission
    submitQuizAnswer: async (courseId, materialId, selectedAnswer) => {
        const response = await api.post(
            `/courses/${courseId}/materials/${materialId}/submit-quiz`,
            { selectedAnswer }
        );
        return response.data;
    },

    // Admin endpoints
    getPendingCourses: async () => {
        const response = await api.get('/courses/admin/pending');
        return response.data;
    },

    approveCourse: async (id) => {
        const response = await api.post(`/courses/admin/${id}/approve`);
        return response.data;
    },

    denyCourse: async (id, reason) => {
        const response = await api.post(`/courses/admin/${id}/deny`, { reason });
        return response.data;
    },

    deleteCourseAsAdmin: async (id) => {
        const response = await api.delete(`/courses/admin/${id}`);
        return response.data;
    },
};
