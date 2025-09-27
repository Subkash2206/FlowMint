# FlowMint MVP - Comprehensive Revenue Tokenization Platform

A full-stack Web3 application that allows creators to tokenize their future revenue and investors to invest in promising projects. Built with Next.js, FastAPI, and smart contracts.

## Features

### Authentication & User Management
- **Wallet-based authentication** with MetaMask integration
- **Role-based access** (Creator/Investor)
- **JWT token authentication** for secure API access
- **User profiles** with bio, avatar, and verification status 

### Creator Dashboard
- **Project management** - Create, edit, and track projects
- **Revenue tracking** - Monitor earnings and investor contributions
- **Analytics** - View total revenue, active projects, and investor count
- **Project creation** with categories (Art, Music, Tech, Gaming)

### Investor Dashboard
- **Investment portfolio** - Track all investments and returns
- **Project discovery** - Browse and filter available projects
- **Revenue history** - View earnings from investments
- **Investment analytics** - Total invested, projects supported

### Project Management
- **Project categories** with filtering
- **Progress tracking** with visual indicators
- **Revenue goals** and current earnings
- **NFT integration** for ownership rights

### Modern UI/UX
- **Responsive design** - Works on all devices
- **Glassmorphism effects** - Modern backdrop blur styling
- **Smooth animations** - Hover effects and transitions
- **Dark theme** - Easy on the eyes
- **Loading states** - Professional user experience

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **Context API** - State management for authentication

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database
- **Pydantic** - Data validation using Python type hints
- **JWT** - JSON Web Tokens for authentication
- **CORS** - Cross-origin resource sharing

### Smart Contracts
- **Solidity** - Smart contract language
- **OpenZeppelin** - Secure smart contract library
- **Hardhat** - Ethereum development environment
- **Polygon Amoy** - Testnet for deployment

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MetaMask wallet
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Subkash2206/FlowMint.git
   ```

2. **Backend Setup**
   ```bash
   cd flowmint-backend
   pip install -r requirements.txt
   python main.py
   ```
   Backend runs on `http://localhost:8000`

3. **Frontend Setup**
   ```bash
   cd flowmint-frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

4. **Access the Application**
   - Open `http://localhost:3000`
   - Connect your MetaMask wallet
   - Choose your role (Creator/Investor)
   - Start using the platform!

## Application Flow

### For Creators
1. **Connect Wallet** → **Select Role** → **Complete Profile**
2. **Create Projects** with descriptions, categories, and revenue goals
3. **Track Progress** with visual indicators and analytics
4. **Manage Revenue** and view investor contributions

### For Investors
1. **Connect Wallet** → **Select Role** → **Complete Profile**
2. **Discover Projects** by category or search
3. **Invest in Projects** and receive NFT ownership rights
4. **Track Returns** and view revenue distributions

## Database Schema

### Users Table
- `id`, `wallet_address`, `username`, `email`
- `role` (creator/investor), `bio`, `profile_image_url`
- `total_revenue`, `total_invested`, `is_verified`
- `created_at`, `updated_at`

### Projects Table
- `id`, `name`, `description`, `category`
- `target_revenue`, `current_revenue`, `nft_token_id`
- `nft_contract_address`, `image_url`, `is_active`
- `creator_id`, `created_at`, `updated_at`

### Investments Table
- `id`, `amount`, `nft_token_id`, `transaction_hash`
- `investor_id`, `project_id`, `created_at`

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login existing user
- `GET /api/user/{wallet_address}` - Get user by wallet

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Deactivate project

### Investments
- `POST /api/investments` - Create investment
- `GET /api/investments` - List investments
- `GET /api/projects/{id}/investments` - Get project investments

### Dashboards
- `GET /api/creator/{id}/dashboard` - Creator dashboard data
- `GET /api/investor/{id}/dashboard` - Investor dashboard data

## UI Components

### Core Components
- **AuthContext** - Authentication state management
- **LoadingSpinner** - Loading states
- **StatsCard** - Dashboard statistics
- **ProjectCard** - Project display
- **InvestmentCard** - Investment display

### Pages
- **Login** - Multi-step authentication flow
- **Dashboard** - Role-based dashboard
- **Home** - Project discovery
- **Project Creation** - Modal for new projects

## Security Features

- **JWT Authentication** - Secure API access
- **Wallet Verification** - MetaMask integration
- **CORS Protection** - Cross-origin security
- **Input Validation** - Pydantic models
- **SQL Injection Prevention** - SQLAlchemy ORM

## 📊 Demo Data

The application comes with pre-populated demo data:
- **4 Demo Users** (2 creators, 2 investors)
- **3 Sample Projects** across different categories
- **4 Sample Investments** with realistic data
- **Profile images** and project images from Unsplash

## 🚀 Deployment

### Backend (Railway/Heroku)
1. Add `Procfile` with `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
2. Set environment variables
3. Deploy with Git push

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Deploy automatically

### Database (PostgreSQL)
1. Replace SQLite with PostgreSQL for production
2. Update connection string in `database.py`
3. Run migrations

## Future Enhancements

- **Real-time notifications** with WebSockets
- **Advanced analytics** with charts and graphs
- **Social features** - Comments, likes, follows
- **Mobile app** with React Native
- **Multi-chain support** - Ethereum, Polygon, BSC
- **AI-powered recommendations**
- **Revenue distribution automation**

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **OpenZeppelin** for secure smart contract libraries
- **Next.js** team for the amazing React framework
- **FastAPI** team for the high-performance Python framework
- **Tailwind CSS** for the utility-first CSS framework
- **Unsplash** for the demo images

---

**Built for the Web3 creator economy**
