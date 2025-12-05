# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Installation
```bash
npm install
```

### Development
To run the development server:
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

### Adding shadcn/ui components
```bash
npx shadcn@latest add [component]
```

## Architecture

This is a Next.js admin dashboard application that uses JWT for authentication.

### Technologies
- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Charting**: Recharts
- **Authentication**: JWT with `jose` library
- **Icons**: Lucide React

### Project Structure
```
nou-admin/
├── app/
│   ├── api/auth/          # API routes for authentication
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   └── globals.css        # Global styles and theme
├── components/
│   ├── ui/                # shadcn/ui components
│   └── admin-sidebar.tsx  # Navigation sidebar
├── lib/
│   ├── jwt.ts            # JWT utilities
│   └── utils.ts          # General utilities
└── middleware.ts         # Route protection
```

### Authentication
Authentication is handled via JWT. The token is stored in an `httpOnly` cookie. The backend API for authentication is mocked in `/app/api/auth/login/route.ts` and should be replaced with a real API call.

Test credentials (seeded in `nou-backend`):
- **Username**: `admin` (or email: `admin@nou.ht`)
- **Password**: `password123`

### Backend Integration
The application is designed to work with the `nou-backend` API. The API URL should be configured in `.env.local` with the `NEXT_PUBLIC_API_URL` variable. API functions are located in `/lib/api/`.

### Features

The admin dashboard includes the following pages:

1. **Tableau de bord** (`/dashboard`) - Global statistics and overview
2. **Membres** (`/dashboard/membres`) - Member management with filters and search
3. **Cotisations** (`/dashboard/cotisations`) - Membership fee management and validation
4. **Dons** (`/dashboard/dons`) - Donation management with approval/rejection workflow
5. **Formations** (`/dashboard/formations`) - Training/course management with modules
6. **Podcasts** (`/dashboard/podcasts`) - Podcast management and upload
7. **Quiz** (`/dashboard/quiz`) - Quiz management
8. **Notifications** (`/dashboard/notifications`) - Push notification system
9. **Statistiques** (`/dashboard/stats`) - Detailed statistics and charts
10. **Parrainage** (`/dashboard/parrainage`) - Referral system overview
11. **Audit** (`/dashboard/audit`) - Audit logs of all admin actions

#### Dons (Donations) Feature

The donations feature allows administrators to:
- View all donations with pagination and filters (status, date range)
- Approve donations (with optional comment)
- Reject donations (with mandatory comment explaining the reason)
- View donation details including uploaded receipts
- Track verification history (admin, date, comments)

See `DONS_FEATURE.md` for detailed documentation.
