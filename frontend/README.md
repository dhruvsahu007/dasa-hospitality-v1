# DASA Hospitality - React Frontend

Modern React frontend application for the DASA Hospitality AI Chatbot Demo platform.

## Features

- ⚛️ **React 18** with modern hooks and functional components
- 🚀 **Vite** for fast development and building
- 📱 **Responsive Design** that works on all devices
- 🎨 **Modern UI** with gradient backgrounds and glassmorphism effects
- 🔄 **API Integration** with axios for backend communication
- ⚡ **Loading States** and error handling
- 🎯 **Interactive Elements** with hover animations

## Project Structure

```
frontend/
├── public/
│   └── images/
│       └── dasa-hos-v1.png    # DASA Hospitality image
├── src/
│   ├── App.jsx                 # Main React component
│   ├── App.css                 # Component styles
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

## Setup & Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Integration

The React frontend connects to the FastAPI backend running on `http://localhost:8001`.

### API Endpoints Used

- `GET /health` - Health check
- `GET /api/info` - Company information
- `GET /api/chatbot/status` - Chatbot status and features

### Features

- **Dynamic Data Loading**: Fetches data from backend API
- **Error Handling**: Graceful fallback when API is unavailable
- **Loading States**: Shows spinner while loading data
- **Real-time Updates**: Ready for real-time features

## React Features

### Hooks Used
- `useState` - Component state management
- `useEffect` - Side effects and API calls
- `Promise.allSettled` - Parallel API calls

### Components
- **App.jsx** - Main application component
- **Responsive Layout** - Mobile-first design
- **Interactive Elements** - Hover effects and animations

## Design Features

- **Glassmorphism Effects**: Modern frosted glass appearance
- **Gradient Backgrounds**: Beautiful color transitions
- **Responsive Grid**: Adapts to different screen sizes
- **Smooth Animations**: CSS transitions and transforms
- **Professional Branding**: Showcases DASA Hospitality image

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development

### Adding New Features

1. **New Components**: Create in `src/components/`
2. **Styling**: Add styles to `App.css` or create component-specific CSS
3. **API Calls**: Add new functions in `App.jsx` or create API service files
4. **State Management**: Use React hooks or consider Redux for complex state

### Code Structure

- **Functional Components**: Modern React patterns
- **Hooks**: useState, useEffect for state and side effects
- **Axios**: HTTP client for API calls
- **CSS Modules**: Scoped styling (can be added)

## Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## Next Steps

This React frontend is ready for:
- AI chatbot integration
- Real-time messaging
- User authentication
- Advanced state management
- Component library expansion

## Troubleshooting

### Common Issues

1. **API Connection Failed**: Ensure backend is running on port 8001
2. **Image Not Loading**: Check if image exists in `public/images/`
3. **Build Errors**: Run `npm install` to ensure all dependencies are installed

### Development Tips

- Use React Developer Tools browser extension
- Check browser console for errors
- Use `console.log` for debugging API calls
- Hot reload should work automatically with Vite
