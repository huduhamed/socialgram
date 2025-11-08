# Socialgram

A modern social media app built with React and Appwrite. It demonstrates a full-stack workflow using TypeScript, Tailwind CSS, and React Query for efficient client-server integrations.

## **Motive**

I built this project to showcase my proficiency in creating efficient, scalable HTTP integrations, managing server-side APIs, and ensuring seamless communication between frontend and backend systems.

Through Socialgram, I aim to demonstrate expertise in React, TypeScript, Tailwind CSS, Appwrite, and modern frontend engineering practices.

## Tech Stack

![React.js](https://img.shields.io/badge/React.js-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![shadcn](https://img.shields.io/badge/shadcn-F59E0B?style=for-the-badge&logo=radix-ui&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-00897B?style=for-the-badge&logo=dependabot&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

## Features

- User authentication with secure signup & login
- Real-time updates with React Query (queries & mutations)
- Responsive design for mobile and desktop
- Post creation, edit and delete flows

## Quick start

Prerequisites: Node.js 18+ is recommended and npm available.

```bash
git clone https://github.com/huduhamed/socialgram.git
cd socialgram
npm install
# Copy the example env and fill values
cp .env.local.example .env.local
npm run dev      # start dev server
npm run build    # build for production
```

## Requirements

- Node.js 18+ (or use your preferred version manager, e.g. nvm)
- npm

## Environment variables (.env.local.example)

Create a `.env.local` file at the project root (do not commit secrets). Example keys:

```
VITE_APPWRITE_URL=https://your-appwrite.example.com
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_STORAGE_ID=your_storage_bucket_id
VITE_APPWRITE_USER_COLLECTION_ID=users_collection_id
VITE_APPWRITE_POST_COLLECTION_ID=posts_collection_id
VITE_APPWRITE_SAVES_COLLECTION_ID=saves_collection_id
```

For exact collection/field names used by the app, check the collections referenced in `src/lib/appwrite/api.ts` and related queries under `src/lib/react-query/queriesAndMutations.ts`.

## Appwrite setup

1. Create an Appwrite project and note the project ID and endpoint URL.
2. Create a Database and the collections required by the app (users, posts, saves). Configure the fields and permissions according to your needs.
3. Create a Storage bucket for file uploads and note the bucket ID.
4. Configure CORS and any required security rules so the frontend can talk to your Appwrite instance.

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — run TypeScript build and create a production bundle

## Status

All current core features are functional: users can create, update, edit and delete posts. Comments UI is planned and in progress.

### Todo

- [x] Create comments section in API
- [x] Create comments attribute in Appwrite
- [x] Implement mutations for creating, updating and deleting comments
- [ ] Implement comment UI under `PostCard`
- [ ] Testing

![explore page](public/assets/images/explore.png)

![signup page](public/assets/images/signup.png)
