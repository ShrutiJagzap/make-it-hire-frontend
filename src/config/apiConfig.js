const API_CONFIG = {
  backend: import.meta.env.VITE_API_BACKEND_URL || 'https://make-it-hire-backend.onrender.com',
  ai: import.meta.env.VITE_API_AI_URL || 'https://make-it-hire-ai-model.onrender.com'
}

export default API_CONFIG