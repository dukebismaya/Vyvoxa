# 🚀 Vyvoxa - Connect, Share, Discover

A modern social media platform built with React, featuring authentic connections, real-time interactions, and a beautiful, responsive design.

![Vyvoxa Preview](https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop&crop=center)

## ✨ Features

- **🔐 Authentication System** - Sign up, login, and secure user management
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **🌙 Dark/Light Mode** - Toggle between themes
- **💬 Real-time Interactions** - Like, comment, and engage with posts
- **📸 Media Sharing** - Share images and create rich content
- **👥 User Profiles** - Customizable profiles with avatars and bios
- **🔍 Search & Discovery** - Find users and content easily
- **📖 Stories** - Share temporary stories with your network
- **🎨 Modern UI** - Beautiful gradients, animations, and smooth transitions

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context
- **Build Tool**: Vite
- **Deployment**: Netlify/Vercel Ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dukebismaya/vyvoxa.git
   cd vyvoxa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Accounts

For testing purposes, the app comes with demo accounts:

- **Email**: `demo@vyvoxa.com` | **Password**: `demo123`
- **Email**: `test@example.com` | **Password**: `test123`

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Netlify

1. **Via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

2. **Via GitHub Integration**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Deploy automatically on commits

### Deploy to Vercel

1. **Via Vercel CLI**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Via GitHub Integration**
   - Import your project to Vercel
   - Auto-detects Vite settings
   - Deploy automatically on commits

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
VITE_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
VITE_APP_URL=https://your-domain.com
```

### Customization

- **Theme Colors**: Edit `tailwind.config.js`
- **App Config**: Edit `src/lib/config.js`
- **Demo Data**: Edit `src/lib/demoData.js`

## 📁 Project Structure

```
vyvoxa/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components
│   │   ├── auth/         # Authentication components
│   │   └── ErrorBoundary.jsx
│   ├── contexts/         # React contexts
│   ├── lib/              # Utilities and configuration
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── netlify.toml          # Netlify configuration
├── vercel.json           # Vercel configuration
└── package.json
```

## 🔍 Key Components

- **App.jsx** - Main application with routing and state
- **AuthContext** - User authentication and session management
- **ErrorBoundary** - Graceful error handling
- **UI Components** - Reusable design system components

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Bismaya Jyoti Dalei**
- GitHub: [@dukebismaya](https://github.com/dukebismaya)

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) - For the excellent UI primitives
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - For smooth animations
- [Lucide](https://lucide.dev/) - For the beautiful icons
- [Unsplash](https://unsplash.com/) - For demo images

---

<div align="center">
  <p>Made with ❤️ for the community</p>
  <p>⭐ Star this repo if you like it!</p>
</div>