# ART5MATA — Funeral Installment Management System

A web-based SaaS application for Filipino funeral service businesses to manage client installment plans, payments, and funeral package records.

---

## Project Description

ART5MATA streamlines the management of funeral service installment agreements. It provides role-based dashboards for administrators and clients, enabling efficient tracking of payment schedules, balances, and plan statuses.

### Key Features
- Role-based authentication (Admin / User) via Supabase
- Admin dashboard with analytics and client management
- User dashboard with installment progress tracking
- Secure login and registration system
- Responsive UI with Tailwind CSS and shadcn/ui components

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + TypeScript               |
| Build Tool  | Vite 6                              |
| Styling     | Tailwind CSS v4 + shadcn/ui         |
| Backend/DB  | Supabase (Auth + PostgreSQL)        |
| UI Icons    | Lucide React + MUI Icons            |
| Charts      | Recharts                            |

---

## Team Members

| Name        | Role               |
|-------------|--------------------|
|             |                    |
|             |                    |
|             |                    |
|             |                    |
|             |                    |

---

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- npm or pnpm
- A Supabase account and project

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ART5MATA
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## Project Structure

```
ART5MATA/
├── src/
│   ├── app/
│   │   ├── App.tsx                  # Root component with auth routing
│   │   └── components/
│   │       ├── Login.tsx            # Login page
│   │       ├── Register.tsx         # Registration page
│   │       ├── AdminDashboard.tsx   # Admin view
│   │       └── UserDashboard.tsx    # Client/user view
│   └── utils/
│       └── supabase/
│           └── client.ts            # Supabase client setup
├── public/
├── index.html
├── package.json
├── README.md
└── STYLE_GUIDE.md
```

---

## Branch Strategy

| Type    | Format                  | Example                      |
|---------|-------------------------|------------------------------|
| Feature | `feature/<short-desc>`  | `feature/user-dashboard`     |
| Bug fix | `fix/<short-desc>`      | `fix/login-redirect-loop`    |
| Hotfix  | `hotfix/<short-desc>`   | `hotfix/supabase-auth-crash` |
| Release | `release/<version>`     | `release/v1.0.0`             |

---

## License

This project is for academic purposes as part of the Software Engineering course.
