# Naval Personnel Management System - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Frontend Documentation](#frontend-documentation)
4. [Backend Documentation](#backend-documentation)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Installation & Setup](#installation--setup)
8. [Deployment](#deployment)
9. [Security Features](#security-features)
10. [Contributing Guidelines](#contributing-guidelines)

---

## Project Overview

### Description
The Naval Personnel Management System is a comprehensive React-based web application designed for managing military personnel contacts, communications, and administrative functions within the Bangladesh Navy. The system provides a hierarchical contact directory, real-time messaging capabilities, and administrative tools for user management.

### Key Features
- **Contact Directory**: Hierarchical organization of naval personnel by branch, sub-branch, and department
- **Real-time Messaging**: Direct and group messaging system
- **User Authentication**: Role-based access control with multiple user types
- **Admin Panel**: Comprehensive user and role management
- **Dashboard**: System overview with statistics and quick actions
- **Feedback System**: User feedback collection and management

### Technology Stack
- **Frontend**: React 18.3.1, TypeScript 5.5.3, Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 7.9.1
- **Icons**: Lucide React 0.344.0
- **Backend Integration**: Supabase 2.57.4, Axios 1.12.2
- **Development**: ESLint, PostCSS, Autoprefixer

---

## Architecture

### System Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                     │
├─────────────────────────────────────────────────────────────┤
│  Components │ Context │ Pages │ Types │ Utils │ Services    │
├─────────────────────────────────────────────────────────────┤
│                    State Management                         │
│  • AuthContext (Authentication)                            │
│  • AppContext (Application Data)                           │
├─────────────────────────────────────────────────────────────┤
│                    Backend Services                         │
│  • Supabase (Authentication & Database)                    │
│  • Mock Data (Development)                                 │
│  • REST API (Future Implementation)                        │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture
```
App
├── AuthProvider
│   └── AppProvider
│       └── Router
│           ├── Login
│           └── Protected Routes
│               └── Layout
│                   ├── Navbar
│                   ├── Sidebar
│                   └── Outlet
│                       ├── Dashboard
│                       ├── Directory
│                       ├── Conversations
│                       ├── Admin
│                       ├── Profile
│                       ├── Settings
│                       └── FeedbackForm
```

---

## Frontend Documentation

### Project Structure
```
src/
├── components/              # Reusable UI components
│   ├── Layout/              # Layout components
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   ├── Navbar.tsx       # Top navigation bar
│   │   └── Sidebar.tsx      # Collapsible sidebar navigation
│   └── UI/                  # Generic UI components
│       ├── ChatWindow.tsx   # Real-time messaging interface
│       ├── ContactCard.tsx  # Contact display component
│       └── ContactDialog.tsx # Contact details modal
├── context/                 # React Context providers
│   ├── AppContext.tsx       # Application state management
│   └── AuthContext.tsx      # Authentication state
├── data/                    # Mock data and constants
│   └── mockData.ts          # Sample data for development
├── pages/                   # Main application pages
│   ├── Login.tsx            # Authentication page
│   ├── Dashboard.tsx        # System overview
│   ├── Directory.tsx        # Contact directory
│   ├── Conversations.tsx    # Messaging interface
│   ├── Admin.tsx            # Administrative panel
│   ├── Profile.tsx          # User profile management
│   ├── Settings.tsx         # Application settings
│   └── FeedbackForm.tsx     # Feedback collection
├── types/                   # TypeScript type definitions
│   └── index.ts             # All type interfaces
├── App.tsx                  # Main application component
├── main.tsx                 # Application entry point
└── index.css                # Global styles
```

### Key Components

#### 1. Layout System
- **Layout.tsx**: Main layout wrapper with sidebar and navbar
- **Navbar.tsx**: Top navigation with user info and notifications
- **Sidebar.tsx**: Collapsible navigation menu with role-based access

#### 2. Core Pages
- **Login.tsx**: Authentication with demo credentials
- **Dashboard.tsx**: System overview with statistics
- **Directory.tsx**: Hierarchical contact browser with filtering
- **Conversations.tsx**: Real-time messaging interface
- **Admin.tsx**: User management and audit logs

#### 3. UI Components
- **ContactCard.tsx**: Contact display with status indicators
- **ContactDialog.tsx**: Detailed contact information modal
- **ChatWindow.tsx**: Real-time messaging interface

### State Management

#### AuthContext
```typescript
interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}
```

#### AppContext
```typescript
interface AppContextType {
  users: User[];
  messages: Message[];
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  sendMessage: (content: string, receiverId?: number, groupId?: number) => void;
  markMessageAsRead: (messageId: number) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: number, user: Partial<User>) => void;
  deleteUser: (id: number) => void;
  createOrFindConversation: (userId: number) => Conversation;
}
```

### Routing
```typescript
// Protected Routes
<Route path="/login" element={<Login />} />
<Route path="/*" element={
  <ProtectedRoute>
    <Layout />
  </ProtectedRoute>
}>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="directory" element={<Directory />} />
  <Route path="conversations" element={<Conversations />} />
  <Route path="admin" element={<Admin />} />
  <Route path="profile" element={<Profile />} />
  <Route path="settings" element={<Settings />} />
  <Route path="feedback" element={<FeedbackForm />} />
  <Route path="" element={<Navigate to="/dashboard" replace />} />
</Route>
```

---

## Backend Documentation

### Current Implementation
The application currently uses **mock data** for development and demonstration purposes. However, it's designed to integrate with **Supabase** as the backend service.

### Supabase Integration
- **Authentication**: Supabase Auth for user management
- **Database**: PostgreSQL database with real-time subscriptions
- **Storage**: File storage for user avatars and documents
- **Functions**: Edge functions for server-side logic

### Environment Configuration
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Mock Authentication System
```typescript
// Demo credentials for testing
const credentials = [
  { username: "admin", password: "admin123", user: mockUsers[0] },
];
```

### Future Backend Implementation
The system is designed to support:
- RESTful API endpoints
- Real-time messaging with WebSockets
- File upload and management
- Email notifications
- Audit logging
- Role-based permissions

