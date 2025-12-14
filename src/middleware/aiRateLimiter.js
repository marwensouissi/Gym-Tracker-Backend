// Simple in-memory rate limiter for AI endpoints
// In production, use Redis or similar for distributed rate limiting

const rateLimitStore = new Map();

export const aiRateLimiter = (options = {}) => {
    const {
        windowMs = 60 * 1000, // 1 minute
        maxRequests = 10, // 10 requests per minute per user
        message = 'Too many AI requests. Please try again later.'
    } = options;

    return (req, res, next) => {
        const userId = req.user?._id?.toString();

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const now = Date.now();
        const userKey = `ai_${userId}`;

        // Get user's request history
        let userRequests = rateLimitStore.get(userKey) || [];

        // Remove expired entries
        userRequests = userRequests.filter(time => now - time < windowMs);

        // Check if limit exceeded
        if (userRequests.length >= maxRequests) {
            return res.status(429).json({
                error: message,
                retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
            });
        }

        // Add current request
        userRequests.push(now);
        rateLimitStore.set(userKey, userRequests);

        // Cleanup old entries periodically
        if (Math.random() < 0.01) { // 1% chance
            cleanupOldEntries(windowMs);
        }

        next();
    };
};

// Cleanup function to prevent memory leaks
function cleanupOldEntries(windowMs) {
    const now = Date.now();
    for (const [key, requests] of rateLimitStore.entries()) {
        const validRequests = requests.filter(time => now - time < windowMs);
        if (validRequests.length === 0) {
            rateLimitStore.delete(key);
        } else {
            rateLimitStore.set(key, validRequests);
        }
    }
}

export default aiRateLimiter;
