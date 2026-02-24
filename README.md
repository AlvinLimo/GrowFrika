# GrowFrika

GrowFrika is an agritech company dedicated to developing software that helps farmers—whether small, medium, or large-scale—to practice agriculture sustainably, efficiently, and profitably, without compromising the environment.

Our first product is a powerful AI-driven tool for coffee farmers. It uses image classification to identify coffee plant diseases and includes an integrated language model to provide expert advice. This empowers farmers with relevant, actionable information tailored to their needs, moving beyond generic advice.

## ✨ Key Features

- **AI-Powered Disease Detection:** Upload an image of a coffee plant leaf and get an instant diagnosis powered by a machine learning model.
- **Expert AI Chat:** Engage with an integrated language model that acts as an expert agronomist, providing advice and answering follow-up questions about diagnoses and coffee plant care.
- **Conversation History:** All your interactions, including image uploads and chat sessions, are saved for future reference.
- **Secure Authentication:** User accounts are protected with JWT-based authentication, including options for email/password and Google OAuth sign-in.

## 🛠️ Tech Stack

| Category      | Technology                                                              |
|---------------|-------------------------------------------------------------------------|
| **Frontend**  | [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/) |
| **Backend**   | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/) |
| **Database**  | [Supabase](https://supabase.com/), [PostgreSQL](https://www.postgresql.org/), [Sequelize](https://sequelize.org/) |
| **AI/ML**     | [Python](https://www.python.org/), Custom classification and language models |
| **Auth**      | [Passport.js](http://www.passportjs.org/) (Google OAuth 2.0), [JWT](https://jwt.io/) |
| **Deployment**| Frontend on [Vercel](https://vercel.com/), Backend on [Railway](https://railway.app/) / [Render](https://render.com/) |

## 📂 Folder Structure

This is a monorepo containing the frontend and backend projects.

```
GrowFrika/
├── client/         # React frontend application
└── server/         # Node.js Express backend API
```

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v20.x or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Python](https://www.python.org/downloads/) (for the ML scripts)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd GrowFrika
```

### 2. Set Up the Backend

a. **Navigate to the server directory:**
```bash
cd server
```

b. **Install dependencies:**
```bash
npm install
```

c. **Set up environment variables:**
Create a file named `.env` in the `server` directory and add the environment variables listed in the [Environment Variables](#-environment-variables) section below.

d. **Run the server:**
```bash
npm run dev
```
The server will start on the port specified in your `.env` file (defaults to `10000`).

### 3. Set Up the Frontend

a. **Navigate to the client directory (from the root):**
```bash
cd client
```

b. **Install dependencies:**
```bash
npm install
```

c. **Run the client:**
```bash
npm run dev
```
The client will start, typically on `http://localhost:5173`.

## 🔑 Environment Variables

The server requires the following environment variables to be set in a `.env` file in the `server` directory.

| Variable                | Description                                                                  |
|-------------------------|------------------------------------------------------------------------------|
| `DATABASE_URL`          | The connection string for your PostgreSQL database (e.g., from Supabase).    |
| `PORT`                  | The port on which the server will run (e.g., `10000`).                         |
| `CLIENT_URL`            | The URL of the deployed frontend application (for CORS and redirects).       |
| `FRONTEND_URL`          | The URL for the local frontend development server (e.g., `http://localhost:5173`). |
| `JWT_SECRET`            | A long, random string used to sign JSON Web Tokens.                          |
| `GOOGLE_CLIENT_ID`      | Google Cloud console client ID for OAuth.                                    |
| `GOOGLE_CLIENT_SECRET`  | Google Cloud console client secret for OAuth.                                |
| `GOOGLE_CALLBACK_URL`   | The callback URL for Google OAuth (e.g., `http://localhost:10000/auth/google/callback`). |
| `EMAIL_USER`            | The email address used to send verification emails.                          |
| `GOOGLE_APP_PASSWORD`   | The app-specific password for the `EMAIL_USER` Gmail account.                |
| `SUPABASE_URL`          | The URL of your Supabase project.                                            |
| `SUPABASE_KEY`          | The `anon` key for your Supabase project.                                    |
| `SERVICE_KEY`           | The `service_role` key for your Supabase project (for backend operations).   |
| `RESEND_API_KEY`        | (Optional) API key if you are using Resend for emails.                       |
| `OPENAI_API_KEY`        | (Optional) API key if you are using OpenAI for the language model.           |

## 📜 Available Scripts

### Server (`/server`)
- `npm run dev`: Starts the server in development mode with hot-reloading.
- `npm run build`: Compiles the TypeScript code to JavaScript.
- `npm run start`: Starts the server in production mode.

### Client (`/client`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the React application for production.
- `npm run lint`: Lints the codebase.
- `npm run preview`: Previews the production build locally.

## 🗺️ API Endpoints

### Authentication (`/auth`)
- `GET /google`: Initiates Google OAuth authentication.
- `GET /google/callback`: Callback URL for Google to redirect to after authentication.

### Users (`/users`)
- `POST /register`: Creates a new user.
- `POST /verify-email`: Verifies a user's email with a token.
- `POST /login`: Logs in a user and returns a JWT.
- `GET /getbyID/:id`: (Protected) Gets a user's profile by their ID.
- `PATCH /update/:id`: (Protected) Updates a user's profile.
- `POST /set-password/:id`: (Protected) Allows a user (e.g., a Google user) to set a password.
- `GET /all`: (Protected) Gets a list of all users.

### Machine Learning (`/api/ml`)
- `POST /predict`: (Protected) Uploads an image for disease classification and starts a new conversation.
- `POST /chat`: (Protected) Sends a message within an existing conversation.
- `GET /conversations`: (Protected) Gets a list of all conversations for the authenticated user.
- `GET /conversations/:convo_id`: (Protected) Gets a specific conversation and all its messages.
- `DELETE /conversation/:convo_id`: (Protected) Deletes a conversation.
- `PATCH /conversation/:convo_id/archive`: (Protected) Archives a conversation.

## ☁️ Deployment

The application is configured for deployment on:
- **Frontend:** [Vercel](https://vercel.com/)
- **Backend:** [Railway](https://railway.app/) or [Render](https://render.com/)

The backend relies on environment variables for configuration, which should be set in the respective hosting provider's dashboard.
