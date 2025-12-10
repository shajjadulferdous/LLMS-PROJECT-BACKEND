import api from './api';

export const enrollService = {
    enrollCourse: async (courseId, paymentData) => {
        const response = await api.post('/enroll', {
            courseId,
            ...paymentData,
        });
        return response.data;
    },

    getMyEnrollments: async () => {
        const response = await api.get('/enroll/me');
        return response.data;
    },

    getEnrollmentById: async (id) => {
        const response = await api.get(`/enroll/${id}`);
        return response.data;
    },

    updateProgress: async (enrollmentId, progressData) => {
        const response = await api.patch(`/enroll/${enrollmentId}/progress`, progressData);
        return response.data;
    },

    completeCourse: async (enrollmentId) => {
        const response = await api.post(`/enroll/${enrollmentId}/complete`);
        return response.data;
    },

    checkEnrollment: async (courseId) => {
        const response = await api.get(`/enroll/check/${courseId}`);
        return response.data;
    },

    getCertificate: async (enrollmentId) => {
        const response = await api.get(`/enroll/${enrollmentId}/certificate`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
