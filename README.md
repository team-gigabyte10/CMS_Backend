# NAVY CMS
Navy Contact Management System - NodeJS Backend API

## Description
A comprehensive Contact Management System built with Node.js and Express.js, featuring TypeScript support, real-time messaging, and advanced organizational structure management for naval operations.

## Features
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Contact Management**: Hierarchical contact organization with unlimited tree structure
- **Real-time Messaging**: Socket.io powered messaging system
- **Excel Import/Export**: Bulk user management via Excel files
- **Dashboard Analytics**: Comprehensive statistics and reporting
- **TypeScript Support**: Full TypeScript compilation and development setup
- **Code Quality**: ESLint configuration and automated linting

## Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **File Processing**: Excel (XLSX)
- **Language**: JavaScript with TypeScript support
- **Code Quality**: ESLint

## Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL >= 5.7

## Installation

1. Clone the repository:
```bash
git clone http://10.1.0.16/swl/navy_cms.git
cd navy_cms
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your database and other configurations
```

4. Set up the database:
```bash
# Import the database schema
mysql -u your_username -p your_database < database_schema.sql
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server (from dist folder)
- `npm run build` - Build the project (lint + compile TypeScript)
- `npm run build:ts` - Compile TypeScript only
- `npm run build:watch` - Watch mode for TypeScript compilation
- `npm run clean` - Clean the dist folder
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm test` - Run tests

## Project Structure
```
navy_cms/
├── src/                    # Source code
│   ├── config/            # Configuration files
│   ├── controllers/       # API controllers
│   ├── middleware/        # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   └── server.js         # Main server file
├── dist/                 # Compiled JavaScript output
├── uploads/              # File uploads directory
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.js         # ESLint configuration
└── database_schema.sql  # Database schema
```

## API Documentation
The API includes comprehensive endpoints for:
- Authentication (login, register, refresh tokens)
- Contact management (CRUD operations, tree structure)
- User management (profiles, roles, permissions)
- Organizational structure (units, departments, ranks)
- Real-time messaging
- Dashboard analytics
- Excel import/export functionality

## Development

### Building the Project
```bash
npm run build
```
This will:
1. Run ESLint to check code quality
2. Compile TypeScript to JavaScript
3. Generate source maps for debugging
4. Output compiled files to `dist/` folder

### Running in Development
```bash
npm run dev
```
This uses ts-node to run TypeScript files directly without compilation.

### Running in Production
```bash
npm run build
npm start
```
This compiles the code and runs the production server from the `dist/` folder.

## Database Schema
The system uses a hierarchical structure with:
- **Users**: Contact information with role-based access
- **Units**: Organizational units with unlimited tree structure
- **Departments**: Department hierarchy
- **Ranks**: Military ranks
- **Designations**: Job positions
- **Messages**: Real-time messaging system
- **Conversations**: Message threads

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `npm run build`
5. Commit your changes
6. Push to your fork
7. Create a Pull Request

## License
This project is licensed under the MIT License.

## Support
For support and questions, please contact the development team.