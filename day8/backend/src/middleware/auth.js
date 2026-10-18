// Mock authentication middleware
// In production, verify JWT tokens here
const auth = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Mock user - replace with real JWT verification
    req.user = { id: 1, name: 'Test User', email: 'test@example.com' };
    next();
};

module.exports = auth;