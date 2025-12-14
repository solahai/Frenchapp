# Café French 🇫🇷☕

An AI-first French learning app that teaches like a great tutor, measures like a test-prep system, and feels like a cozy daily ritual—built on evidence-based learning (spacing + retrieval + corrective feedback) rather than just gamification.

## 🎯 Product Vision

Most apps optimize streaks; Café French optimizes **real-world French**: speaking clearly, understanding fast speech, writing without "A2 fossil errors," and progressing along CEFR can-dos (A1→C2).

**North Star Outcome:**
> "In 30 days, I can handle café / clinic / school / errands conversations with confidence—without translating in my head."

## ✨ Key Features

### 1. Daily 20-min Adaptive Lesson
- Personalized lessons based on your level, goals, and performance
- Interleaved practice mixing grammar, vocabulary, listening, and speaking
- Cognitive load balancing to prevent overwhelm

### 2. Café Conversation Mode
- AI-powered conversation partner with strict but friendly feedback
- Multiple scenarios: ordering, appointments, travel, daily life
- Real-time corrections with repair loops

### 3. Pronunciation Lab
- Phoneme-by-phoneme accuracy scoring
- Liaison and enchaînement detection
- Prosody and rhythm coaching
- Visual mouth position guides

### 4. Mistake Memory System
- Personal "error genome" tracking your patterns
- Weekly targeted remediation workouts
- Graduation criteria based on consecutive correct responses

### 5. Cultural Immersion
- Authentic French content (videos, audio, articles)
- Comprehension quizzes
- Vocabulary reuse in conversation practice

### 6. 30-Day Level-Up Challenge
- CEFR-mapped micro-goals
- Weekly milestones
- Visible progress through can-do statements

## 🏗️ Architecture

### Frontend (React Native + Expo)
- Cross-platform mobile app (iOS & Android)
- Offline-first with local caching
- Beautiful, accessible Material Design UI

### Backend (Node.js + Express)
- RESTful API with JWT authentication
- SQLite database for persistence
- WebSocket support for real-time features

### AI Integration
- **OpenAI GPT-4**: Conversation, grammar explanations, content generation
- **OpenAI Whisper**: Speech-to-text transcription
- **ElevenLabs**: High-quality French text-to-speech

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key
- ElevenLabs API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-repo/cafe-french.git
cd cafe-french
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:

**Backend (.env):**
\`\`\`bash
cd backend
cp .env.example .env
# Edit .env with your API keys
\`\`\`

**Mobile (.env):**
\`\`\`bash
cd mobile
cp .env.example .env
# Edit .env with your API URL
\`\`\`

4. Start the backend:
\`\`\`bash
cd backend
npm run dev
\`\`\`

5. Start the mobile app:
\`\`\`bash
cd mobile
npx expo start
\`\`\`

## 📱 Mobile App Structure

\`\`\`
mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   ├── (tabs)/            # Main tab navigation
│   ├── lesson.tsx         # Daily lesson screen
│   ├── conversation.tsx   # Chat screen
│   ├── flashcards.tsx     # SRS review
│   ├── pronunciation.tsx  # Speaking practice
│   └── ...
├── src/
│   ├── components/ui/     # Reusable components
│   ├── services/          # API client
│   ├── store/             # Zustand state
│   └── theme/             # Design tokens
└── package.json
\`\`\`

## 🔧 Backend Structure

\`\`\`
backend/
├── src/
│   ├── index.ts           # Express app entry
│   ├── middleware/        # Auth, error handling
│   ├── routes/            # API endpoints
│   └── services/          # Business logic
│       ├── openai.ts      # AI integration
│       ├── elevenlabs.ts  # TTS integration
│       ├── srsEngine.ts   # Spaced repetition
│       └── ...
└── package.json
\`\`\`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Lessons
- `GET /api/lessons/daily` - Get today's lesson
- `POST /api/lessons/:id/start` - Start lesson
- `POST /api/lessons/:id/complete` - Complete lesson

### Conversation
- `POST /api/conversation/start` - Start chat session
- `POST /api/conversation/:id/message` - Send message
- `POST /api/conversation/:id/end` - End session

### SRS
- `GET /api/srs/due` - Get due cards
- `POST /api/srs/review` - Submit review

### Pronunciation
- `POST /api/pronunciation/assess` - Assess speaking
- `GET /api/pronunciation/shadowing` - Get shadowing session

## 🎨 Design System

### Colors
- Primary: `#2563EB` (French Blue)
- Success: `#22C55E`
- Warning: `#F59E0B`
- Error: `#EF4444`

### Typography
- Font Family: System default (SF Pro / Roboto)
- Scale: xs (11), sm (13), md (15), lg (17), xl (20), xxl (24), xxxl (32)

## 🔐 Security

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation with express-validator
- Helmet.js for security headers

## 📊 Learning Science

Café French is built on evidence-based learning principles:

1. **Retrieval Practice**: Active recall over passive review
2. **Spaced Repetition**: SM-2 algorithm for optimal retention
3. **Interleaving**: Mixed practice prevents "practice illusion"
4. **Corrective Feedback**: Immediate, specific corrections
5. **CEFR Alignment**: Every item tagged to can-do statements

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

---

Made with ❤️ for French learners everywhere. Bonne chance!
