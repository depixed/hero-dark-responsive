# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c37be01f-6d7d-45c1-9fcf-7fba846bb162

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c37be01f-6d7d-45c1-9fcf-7fba846bb162) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c37be01f-6d7d-45c1-9fcf-7fba846bb162) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

# Incorpify AI Chat App

## Setup Instructions

### Setting up Storage for File Attachments

To enable file attachments in the chat, you need to configure Supabase Storage:

1. Log in to your Supabase Dashboard
2. Go to the "Storage" section in the left sidebar
3. Click "Create a new bucket"
4. Enter the name: `chat_attachments`
5. Set "Public bucket" to either:
   - OFF (recommended): for security, you'll rely on RLS policies
   - ON: for easier setup, but less secure
6. Set file size limit (recommended: 10MB)
7. Click "Create bucket"

### Configure Row-Level Security (RLS) Policies

To ensure users can only access their own files:

1. After creating the bucket, go to the "Policies" tab
2. Create a new policy for INSERT with the following settings:
   - Policy name: "Users can upload their own files"
   - Allowed operation: INSERT
   - Policy definition: `(auth.uid()::text = (storage.foldername(name))[1])`
3. Create a new policy for SELECT with the following settings:
   - Policy name: "Users can view their own files"
   - Allowed operation: SELECT 
   - Policy definition: `(auth.uid()::text = (storage.foldername(name))[1])`

### Database Schema

Run the following SQL in Supabase SQL Editor to add the necessary columns for file attachments:

```sql
-- Add attachment columns to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;
```

## Features

- AI Chat with message history
- Support for OpenAI and Google Gemini AI models
- Markdown rendering in messages
- File attachments (images, PDFs, and documents)
- User authentication and session management
- Theme support (light/dark mode)

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
