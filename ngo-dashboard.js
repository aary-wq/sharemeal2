import { requireAuth } from './middleware/protectedRoute.js';

// Check authentication and role
requireAuth(['ngo']); 