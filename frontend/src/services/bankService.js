import api from './api';

export const bankService = {
    createAccount: async (accountData) => {
        const response = await api.post('/bank', accountData);
        return response.data;
    },

    getAccount: async () => {
        const response = await api.get('/bank/me');
        return response.data;
    },

    deposit: async (amount) => {
        const response = await api.post('/bank/deposit', { amount });
        return response.data;
    },

    withdraw: async (amount, password) => {
        const response = await api.post('/bank/withdraw', { amount, password });
        return response.data;
    },

    getBalance: async () => {
        const response = await api.get('/bank/me');
        return response.data;
    },
};
