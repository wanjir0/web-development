
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    config.headers.Authorization = 'Bearer mock-jwt-token';
    return config;
});

export default api;
