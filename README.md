# Social Media Automation Platform

A comprehensive multi-language social media automation platform for remote teams with content scheduling, collaboration features, and analytics.

## Features

- **Multi-language Support**: English, Spanish, French, German, Japanese, Portuguese (Brazil)
- **Social Media Platforms**: Twitter, Facebook, LinkedIn, Instagram, TikTok, Pinterest
- **Content Scheduling**: Schedule posts across multiple platforms
- **Team Collaboration**: Invite team members, assign roles, approval workflows
- **Content Templates**: Reusable templates with placeholders
- **Analytics Dashboard**: Track performance and team productivity
- **Persistent Storage**: PostgreSQL database for data persistence

## Local Installation & Setup

### Prerequisites

- Node.js 18+ installed on your machine
- PostgreSQL database (local or remote)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd social-media-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/social_media_db
   NODE_ENV=development
   PORT=5000
   ```

4. **Set up the database**
   ```bash
   # Create the database
   createdb social_media_db
   
   # Push the schema to the database
   npm run db:push
   
   # Seed the database with sample data
   npx tsx scripts/seed-database.ts
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open your browser and navigate to: `http://localhost:5000`

## Database Setup Options

### Option 1: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database: `createdb social_media_db`
3. Update the `DATABASE_URL` in your `.env` file

### Option 2: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name postgres-social \
  -e POSTGRES_DB=social_media_db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Update your .env file
DATABASE_URL=postgresql://admin:password@localhost:5432/social_media_db
```

## Production Deployment (Local)

For a production-like setup on your local machine:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start in production mode**
   ```bash
   NODE_ENV=production npm start
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Default Users

After seeding the database, you can log in with:

- **Admin**: sarah.chen / hashed_password_1
- **Editor**: mike.rodriguez / hashed_password_2
- **Viewer**: emma.johnson / hashed_password_3

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Express backend
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data access layer
├── shared/                # Shared types and schemas
└── scripts/               # Database scripts
```

## Configuration

The application runs on `localhost:5000` by default. To change the port, update the `PORT` environment variable in your `.env` file.

## Troubleshooting

- **Database connection issues**: Check your PostgreSQL service is running and connection string is correct
- **Port conflicts**: Change the PORT in your `.env` file
- **Module not found**: Run `npm install` to ensure all dependencies are installed

## Support

This is a local development setup. All data is stored locally and the application is not accessible from the internet unless you specifically configure port forwarding or hosting.