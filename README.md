# Mera Bacha Meri Shan

An educational platform for parents, students, and the community. Built with the MERN stack.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, TanStack React Query
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Auth:** JWT with refresh tokens, bcrypt, HTTP-only cookies
- **Media:** Cloudinary
- **Email:** Nodemailer

## Project Structure

```
MeraBachaMeriShan/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service layer
│   │   └── utils/          # Utility functions
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Route handlers
│   ├── routes/             # Express routes
│   ├── models/             # Mongoose models
│   ├── middleware/         # Custom middleware
│   ├── validators/         # Express validators
│   ├── config/             # DB & Cloudinary config
│   ├── utils/              # Utility functions
│   ├── index.js            # Entry point
│   └── package.json
├── .env.example
└── README.md
```

## Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd MeraBachaMeriShan

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` in the root directory and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email settings

### 3. Run Seed

```bash
cd server
npm run seed
```

This creates a super admin:
- Email: `admin@merabachamerishan.com`
- Password: `Admin@123`

### 4. Start Development

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Set root directory: `client`
4. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-app.onrender.com/api/v1`)
5. Deploy

### Backend (Render)

1. Push to GitHub
2. Create Web Service in Render
3. Root directory: `server`
4. Start command: `node index.js`
5. Add environment variables from `.env`

### Database (MongoDB Atlas)

1. Create cluster in MongoDB Atlas
2. Get connection string
3. Add to environment variables

### Media (Cloudinary)

1. Create Cloudinary account
2. Get cloud name, API key, API secret
3. Add to environment variables

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/forgot-password` | Forgot password |
| PUT | `/api/v1/auth/reset-password/:token` | Reset password |
| PUT | `/api/v1/auth/update-password` | Update password |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/videos` | List videos (paginated) |
| GET | `/api/v1/videos/featured` | Featured videos |
| GET | `/api/v1/videos/:id` | Get video |
| GET | `/api/v1/videos/:id/related` | Related videos |
| POST | `/api/v1/videos` | Create video |
| PUT | `/api/v1/videos/:id` | Update video |
| DELETE | `/api/v1/videos/:id` | Delete video |

### Categories, Quotes, Articles, Events, Images, Contact, Users, Settings, Logs

Full API documentation is available in the Postman collection (not yet published).

## Roles

- **Guest** - Unauthenticated visitor
- **User** - Registered user with dashboard access
- **Moderator** - Can upload content
- **Admin** - Full content management
- **Super Admin** - All permissions including settings and user management

## Features

- Video library with categories and search
- Articles for parents
- Community events and gallery
- User authentication with JWT
- User dashboard with bookmarks and history
- Admin dashboard with full CMS
- Cloudinary media integration
- Responsive design
- SEO optimized
