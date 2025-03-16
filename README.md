# PastorAI - Biblical Guidance Chat Interface

A modern chat interface that provides spiritual guidance based on Biblical teachings, powered by OpenAI's GPT-4.

## Features

- Biblical-based AI responses with scripture references
- Multi-media support (images, audio, video, files)
- Dark mode support
- Conversation management
- Real-time audio recording
- Responsive design

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API
- Vercel (Deployment)

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
4. Add your OpenAI API key to the `.env` file
5. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment on Vercel

1. Push your code to a GitHub repository

2. Visit [Vercel](https://vercel.com) and sign in with GitHub

3. Click "Import Project" and select your repository

4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

5. Add Environment Variables:
   - Go to Settings > Environment Variables
   - Add `OPENAI_API_KEY` with your OpenAI API key

6. Deploy!

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)

## Security Notes

- Never commit your actual API keys to the repository
- Always use environment variables for sensitive data
- Keep your API keys private and secure

## License

MIT License
