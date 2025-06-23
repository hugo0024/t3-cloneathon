# Supabase Setup Guide for Next.js Chat App

This guide will help you set up Supabase for this Next.js chat application that features AI-powered conversations, file attachments, and quality metrics.

## Prerequisites

- A [Supabase](https://supabase.com) account
- This Next.js project cloned locally
- Node.js installed

## Quick Setup Checklist

- [ ] Create Supabase project
- [ ] Configure environment variables
- [ ] Set up authentication
- [ ] Create database schema
- [ ] Set up file storage
- [ ] Test the setup

## Detailed Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New project"
3. Choose your organization
4. Enter project details:
   - **Name**: `chat-app` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose the closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for project initialization

### 2. Configure Environment Variables

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**
   - **anon public key**

3. Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Set up Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:

**Site URL** (for development):
```
http://localhost:3000
```

**Redirect URLs**:
```
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

3. **Enable Email authentication** (enabled by default)
4. Optionally enable social providers:
   - Google OAuth
   - GitHub OAuth
   - Others as needed

### 4. Create Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `supabase-setup.sql`
4. Click "Run" to execute the SQL

This creates:
- **profiles**: User profile information
- **conversations**: Chat conversations
- **messages**: Individual chat messages
- **attachments**: File attachments (images, PDFs)
- **message_quality_metrics**: Quality metrics for AI responses

### 5. Set up File Storage

1. Go to **Storage** in your Supabase dashboard
2. Click "Create a new bucket"
3. Bucket details:
   - **Name**: `attachments`
   - **Public bucket**: ✅ (checked)
   - **File size limit**: 10MB
   - **Allowed MIME types**: Leave empty (we handle this in code)

4. After creating the bucket, go to **Storage** → **Policies**
5. Create a new query in SQL Editor
6. Copy and paste the contents of `storage-policies.sql`
7. Click "Run" to execute

### 6. Test Your Setup

1. Install the required dependency for testing:
```bash
npm install dotenv
```

2. Run the test script:
```bash
node test-supabase-setup.js
```

If everything is set up correctly, you should see:
```
✅ Database connection successful
✅ Storage setup successful
✅ Auth configuration successful
🎉 Supabase setup is complete and working!
```

### 7. Run the Application

```bash
npm run dev
```

Navigate to `http://localhost:3000` and:
1. Click "Login" to create an account
2. Sign up with email or social provider
3. Start chatting!

## Database Schema Overview

### Tables Created

1. **profiles**
   - User profile information
   - Links to auth.users
   - Stores OpenRouter API keys

2. **conversations**
   - Chat conversation metadata
   - Belongs to users
   - Tracks AI model used

3. **messages**
   - Individual chat messages
   - Supports user, assistant, and system roles
   - Belongs to conversations

4. **attachments**
   - File attachments for messages
   - Supports images and PDFs
   - Linked to Supabase Storage

5. **message_quality_metrics**
   - Quality metrics for AI responses
   - Tracks performance metrics
   - Response time, token usage, etc.

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- File uploads restricted to user folders
- Secure JWT-based authentication

## Common Issues & Solutions

### Environment Variables Not Loading
- Make sure `.env.local` is in your project root
- Restart your development server after creating the file

### Database Connection Issues
- Check your project URL and anon key are correct
- Ensure your Supabase project is fully initialized

### Authentication Redirect Issues
- Verify your redirect URLs in Supabase Auth settings
- Check that `/auth/callback` route exists

### File Upload Issues
- Ensure the `attachments` bucket is created and public
- Verify storage policies are applied correctly

## Production Deployment

When deploying to production:

1. Update **Site URL** and **Redirect URLs** in Supabase Auth settings
2. Add production environment variables to your hosting platform
3. Consider enabling email confirmations for better security
4. Monitor usage and upgrade your Supabase plan if needed

## Support

If you encounter issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the test script output for specific errors
3. Check browser console for client-side issues
4. Verify all SQL scripts ran successfully

## Features Enabled

With this setup, your chat app will support:
- ✅ User authentication and profiles
- ✅ Multi-conversation chat history
- ✅ File attachments (images, PDFs)
- ✅ AI response quality metrics
- ✅ Real-time updates
- ✅ Secure file storage
- ✅ Data privacy and security 