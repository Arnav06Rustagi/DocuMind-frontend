# DocuMind Frontend

Next.js 16 frontend interface for DocuMind - an AI-driven document parsing, summarization, and extractive Q&A application.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Set `NEXT_PUBLIC_API_URL` to your backend URL (defaults to `http://localhost:8000`).

3. Start development server:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000).

## Netlify Deployment

1. Push this repository to GitHub.
2. Sign in to [Netlify](https://app.netlify.com).
3. Click **Add new site** > **Import an existing project** > **GitHub**.
4. Select this repository.
5. In **Build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. In **Environment variables**:
   - Add `NEXT_PUBLIC_API_URL` set to your Render backend URL (e.g. `https://documind-backend.onrender.com`).
7. Click **Deploy site**.
