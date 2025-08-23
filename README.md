# Chat Ecosystem

A modern chat application that integrates multiple platforms (Discord, Slack, Teams, Telegram) into one unified interface.

## Features

- 🔐 **Authentication** - Secure user signup/login with Supabase
- 💬 **Multi-platform Chat** - Connect Discord, Slack, Teams, and Telegram
- 🎨 **Modern UI** - Built with React, TypeScript, and Tailwind CSS
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔔 **Notifications** - Customizable notification preferences
- 👤 **User Profiles** - Avatar upload and profile management
- ⚡ **Real-time** - Live message updates
- 🎯 **Demo Mode** - Try the app without signing up

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project

### Installation

1. **Clone and setup the project:**
   ```bash
   # Create a new directory
   mkdir chat-ecosystem
   cd chat-ecosystem
   
   # Initialize git (optional)
   git init
   ```

2. **Copy all the files from Figma Make to your local directory following the file structure shown above.**

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up environment variables:**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env and add your Supabase credentials
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

### Environment Setup

You'll need to create a Supabase project and get your credentials:

1. Go to [Supabase](https://supabase.com/dashboard)
2. Create a new project
3. Go to Settings > API
4. Copy your Project URL and anon public key
5. Update your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_DB_URL=your-db-url
```

### File Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── ChatSidebar.tsx # Chat sources sidebar
│   ├── ChatWindow.tsx  # Main chat interface
│   ├── ChatMessage.tsx # Individual message component
│   ├── AuthDialog.tsx  # Authentication modal
│   └── ...
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── styles/             # Global CSS and Tailwind config
└── App.tsx             # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Features

### Keyboard Shortcuts
- `Ctrl+B` - Toggle sidebar
- `Escape` - Close dialogs

### Chat Integration
The app supports connecting to multiple chat platforms. In demo mode, you can explore the interface without connecting real accounts.

### User Settings
- Profile management with avatar upload
- Comprehensive notification preferences
- Password management and security settings

## Backend

The application uses Supabase for:
- Authentication
- Real-time database
- File storage (avatars)
- Edge functions (API server)

## Development

### Adding New Components

New UI components should be added to `src/components/ui/` and follow the shadcn/ui patterns.

### Styling

The project uses Tailwind CSS v4 with a custom design system. Global styles are in `src/styles/globals.css`.

### State Management

The app uses React hooks for state management, with custom hooks in `src/hooks/` for complex logic.

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting platform (Vercel, Netlify, etc.)

3. Make sure to set environment variables in your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details# multiple-chat
