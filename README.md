# 🏘️ CommUnityVoice

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![SQLite](https://img.shields.io/badge/Database-SQLite-lightgrey)

> **Empowering communities to turn voices into action.**  
> Report, vote, and track local issues – together we build stronger neighborhoods.

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [User Roles](#-user-roles)
- [API Endpoints](#-api-endpoints)
- [Color Palette](#-color-palette)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)
- [Acknowledgements](#-acknowledgements)

---

## 🌟 Overview

CommUnityVoice is a full‑stack web application that connects residents, local administrators, and service providers. It enables community members to report issues (e.g., potholes, broken streetlights, illegal dumping) and vote on them, while area‑specific admins manage and resolve those issues. A super administrator oversees all areas.

---

## ✨ Features

- 🗳️ **Vote on Issues** – Approve or reject community reports.
- 📍 **Area‑Based Access** – Users only see and report issues in their assigned area.
- 🛡️ **Role‑Based Authentication** – Regular users, area admins, and super admins.
- 🔐 **Secure Registration** – Email or phone number required; optional admin tokens.
- 📸 **Image Uploads** – Attach photos to issues.
- 🔍 **Filtering & Search** – Filter by issue type or search within your area.
- 🎨 **Modern UI** – Tailwind CSS with custom color palette and background overlay.
- 🔄 **Password Reset** – Via email or SMS (Twilio integration ready).
- 📊 **Admin Dashboard** – Area admins manage only their area; super admin manages all.

---

## 🛠️ Tech Stack

| Frontend         | Backend          | Database   | Tools           |
| ---------------- | ---------------- | ---------- | --------------- |
| React 18         | Node.js + Express| SQLite3    | Git             |
| React Router     | JWT Authentication|            | NPM             |
| Tailwind CSS     | bcrypt           |            | dotenv          |
| Axios            | Multer (uploads) |            | Nodemon         |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/communityvoice.git
cd communityvoice
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (see [Environment Variables](#environment-variables)).

Initialize the database with mock data (optional):
```bash
npm run db:areas
npm run db:users
npm run db:issues
npm run db:votes
```

Start the backend server:
```bash
npm run dev
# or
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

The app will open at `http://localhost:3000`.

---

## 🔧 Environment Variables

Create a `.env` file in the `backend` folder with the following variables. **Replace the example values with your own secrets.**

```env
# JWT Secret (change this!)
JWT_SECRET=your_super_secret_jwt_key_here

# Area‑specific Admin Tokens (one per area – match area names in DB)
ADMIN_TOKEN_SUNNYVALE=your_sunnyvale_token_here
ADMIN_TOKEN_GREEN_MEADOWS=your_green_meadows_token_here
ADMIN_TOKEN_OAK_RIDGE=your_oak_ridge_token_here
ADMIN_TOKEN_RIVERSIDE=your_riverside_token_here
ADMIN_TOKEN_HILLCREST=your_hillcrest_token_here
ADMIN_TOKEN_JOHANNESBURG=your_joburg_token_here
ADMIN_TOKEN_EKURHULENI=your_ekurhuleni_token_here
ADMIN_TOKEN_TSHWANE=your_tshwane_token_here
ADMIN_TOKEN_CAPE_TOWN=your_cpt_token_here
ADMIN_TOKEN_ETHEKWINI=your_durban_token_here
ADMIN_TOKEN_PARKVIEW=your_parkview_token_here
ADMIN_TOKEN_HARBOUR_VIEW=your_harbour_view_token_here
ADMIN_TOKEN_MOUNTAIN_RIDGE=your_mountain_ridge_token_here
ADMIN_TOKEN_GARDENS=your_gardens_token_here
ADMIN_TOKEN_CITY_LOFTS=your_citylofts_token_here

# Super Admin Token (access all areas)
SUPER_ADMIN_TOKEN=your_super_admin_token_here

# Email (for password reset – optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio (for SMS – optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

> ⚠️ **Never commit your `.env` file!** It is already in `.gitignore`.

---

## 🗂️ Database Schema

The SQLite database (`database.db`) is created automatically. Key tables:

| Table            | Description                                         |
|------------------|-----------------------------------------------------|
| `users`          | Stores user credentials, role, and assigned `area_id`. |
| `areas`          | Predefined estates, municipalities, and complexes.  |
| `issues`         | Community reports linked to a user and an area.     |
| `votes`          | Tracks approve/reject votes per issue.              |
| `password_resets`| Tokens for password recovery.                       |

---

## 👥 User Roles

| Role          | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| **User**      | Can report issues, vote, and view only their area’s issues.                |
| **Area Admin**| Assigned to one area; can manage (update/delete) issues **only in that area**. |
| **Super Admin**| No area restriction; can manage all issues and areas.                      |

### 🔑 Admin Registration
- To register as an **area admin**, include the corresponding token from your `.env` in the `adminToken` field during signup.  
- To register as a **super admin**, use the `SUPER_ADMIN_TOKEN`.

---

## 📡 API Endpoints (Summary)

| Method | Endpoint                     | Description                          | Auth           |
|--------|------------------------------|--------------------------------------|----------------|
| POST   | `/api/auth/register`         | Register a new user                  | Public         |
| POST   | `/api/auth/login`            | Login                                | Public         |
| GET    | `/api/issues`                | Get all issues (filtered by area)    | JWT            |
| POST   | `/api/issues`                | Create a new issue                   | JWT            |
| PATCH  | `/api/issues/:id/status`     | Update issue status                  | JWT + area check|
| DELETE | `/api/issues/:id`            | Delete an issue                      | JWT + area check|
| POST   | `/api/votes`                 | Vote on an issue                     | JWT            |
| GET    | `/api/areas`                 | List all areas                       | Public         |
| POST   | `/api/password-reset/request`| Request password reset               | Public         |
| POST   | `/api/password-reset/reset`  | Reset password with token/code       | Public         |

For full details, refer to the source code.

---

## 🎨 Color Palette

| Color        | Hex     | RGB               |
|--------------|---------|-------------------|
| Primary      | #A5C89E | `165,200,158`     |
| Secondary    | #FFFBB1 | `255,251,177`     |
| Accent 1     | #D8E983 | `216,233,131`     |
| Accent 2     | #AEB877 | `174,184,119`     |
| Dark Text    | #2c3e50 | `44,62,80`        |

The background image is overlaid with `rgba(165, 200, 158, 0.3)` for a soft effect.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👩‍💻 Author

**Serepa Selaelo Rebecca**  
- GitHub: [@yourusername](https://github.com/RebeccaSer)
- LinkedIn: [Your LinkedIn]([https://linkedin.com/in/yourprofile](https://www.linkedin.com/in/selaelo-rebecca-serepa-b44081265/))

---

## 🙏 Acknowledgements

- [Tailwind CSS](https://tailwindcss.com)
- [React](https://reactjs.org)
- [SQLite](https://sqlite.org)
- [Express](https://expressjs.com)
- All the community members who inspired this project!

---

<p align="center">Made with ❤️ for stronger communities.</p>
