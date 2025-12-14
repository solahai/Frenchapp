"use strict";
// SQLite Database Service
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class DatabaseService {
    constructor() {
        this.db = null;
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    initialize() {
        const dbPath = process.env.DATABASE_PATH || './data/cafe-french.db';
        const dbDir = path_1.default.dirname(dbPath);
        // Ensure directory exists
        if (!fs_1.default.existsSync(dbDir)) {
            fs_1.default.mkdirSync(dbDir, { recursive: true });
        }
        this.db = new better_sqlite3_1.default(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.createTables();
        this.seedInitialData();
        console.log('Database initialized successfully');
    }
    createTables() {
        if (!this.db)
            throw new Error('Database not initialized');
        // Users table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL,
        avatar_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        preferences TEXT DEFAULT '{}',
        profile TEXT DEFAULT '{}'
      )
    `);
        // User sessions
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        device_info TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
        // Vocabulary progress
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS vocabulary_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        vocabulary_id TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        ease_factor REAL DEFAULT 2.5,
        interval INTEGER DEFAULT 0,
        repetitions INTEGER DEFAULT 0,
        next_review TEXT,
        last_reviewed TEXT,
        correct_count INTEGER DEFAULT 0,
        incorrect_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, vocabulary_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
        // SRS Cards
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS srs_cards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        source_type TEXT,
        source_id TEXT,
        level TEXT,
        tags TEXT,
        status TEXT DEFAULT 'new',
        ease_factor REAL DEFAULT 2.5,
        interval INTEGER DEFAULT 0,
        repetitions INTEGER DEFAULT 0,
        next_review TEXT,
        last_reviewed TEXT,
        total_reviews INTEGER DEFAULT 0,
        correct_reviews INTEGER DEFAULT 0,
        lapses INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
        // Lessons
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        level TEXT NOT NULL,
        status TEXT DEFAULT 'scheduled',
        content TEXT NOT NULL,
        metrics TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
        // Conversation sessions
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        mode TEXT NOT NULL,
        scenario_id TEXT,
        level TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        messages TEXT DEFAULT '[]',
        corrections TEXT DEFAULT '[]',
        debrief TEXT,
        metrics TEXT DEFAULT '{}',
        start_time TEXT DEFAULT CURRENT_TIMESTAMP,
        end_time TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
        // Mistake profiles
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS mistake_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        grammar_errors TEXT DEFAULT '[]',
        vocabulary_confusions TEXT DEFAULT '[]',
        pronunciation_errors TEXT DEFAULT '[]',
        graduated_errors TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
        // Progress snapshots
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS progress_snapshots (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        wrrs TEXT,
        level_progress TEXT,
        skill_scores TEXT,
        stats TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
        // Challenges
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        start_level TEXT NOT NULL,
        target_level TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        current_day INTEGER DEFAULT 1,
        daily_plan TEXT DEFAULT '[]',
        weekly_milestones TEXT DEFAULT '[]',
        progress_metrics TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
        // Vocabulary items (content)
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS vocabulary (
        id TEXT PRIMARY KEY,
        french TEXT NOT NULL,
        english TEXT NOT NULL,
        ipa TEXT,
        part_of_speech TEXT,
        gender TEXT,
        level TEXT NOT NULL,
        frequency TEXT,
        themes TEXT,
        examples TEXT,
        audio_url TEXT,
        conjugations TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Grammar rules (content)
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS grammar_rules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        title_fr TEXT,
        category TEXT NOT NULL,
        level TEXT NOT NULL,
        explanation TEXT NOT NULL,
        examples TEXT,
        common_traps TEXT,
        quick_checks TEXT,
        tags TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Cultural content
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS cultural_content (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        title_fr TEXT,
        description TEXT,
        level TEXT NOT NULL,
        content TEXT NOT NULL,
        vocabulary TEXT,
        quiz TEXT,
        themes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create indexes
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_vocabulary_progress_user ON vocabulary_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_vocabulary_progress_next_review ON vocabulary_progress(next_review);
      CREATE INDEX IF NOT EXISTS idx_srs_cards_user ON srs_cards(user_id);
      CREATE INDEX IF NOT EXISTS idx_srs_cards_next_review ON srs_cards(next_review);
      CREATE INDEX IF NOT EXISTS idx_lessons_user_date ON lessons(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_vocabulary_level ON vocabulary(level);
      CREATE INDEX IF NOT EXISTS idx_grammar_level ON grammar_rules(level);
    `);
    }
    seedInitialData() {
        if (!this.db)
            throw new Error('Database not initialized');
        // Check if vocabulary already seeded
        const vocabCount = this.db.prepare('SELECT COUNT(*) as count FROM vocabulary').get();
        if (vocabCount.count === 0) {
            this.seedVocabulary();
            this.seedGrammarRules();
            console.log('Initial content seeded');
        }
    }
    seedVocabulary() {
        const vocabulary = [
            // A1 - Greetings
            { id: 'v-bonjour', french: 'bonjour', english: 'hello/good day', ipa: 'bɔ̃.ʒuʁ', part_of_speech: 'interjection', level: 'A1', frequency: 'very_high', themes: '["greetings"]' },
            { id: 'v-bonsoir', french: 'bonsoir', english: 'good evening', ipa: 'bɔ̃.swaʁ', part_of_speech: 'interjection', level: 'A1', frequency: 'high', themes: '["greetings"]' },
            { id: 'v-salut', french: 'salut', english: 'hi/bye (informal)', ipa: 'sa.ly', part_of_speech: 'interjection', level: 'A1', frequency: 'very_high', themes: '["greetings"]' },
            { id: 'v-aurevoir', french: 'au revoir', english: 'goodbye', ipa: 'o ʁə.vwaʁ', part_of_speech: 'interjection', level: 'A1', frequency: 'very_high', themes: '["greetings"]' },
            { id: 'v-merci', french: 'merci', english: 'thank you', ipa: 'mɛʁ.si', part_of_speech: 'interjection', level: 'A1', frequency: 'very_high', themes: '["politeness"]' },
            { id: 'v-svp', french: "s'il vous plaît", english: 'please (formal)', ipa: 'sil vu plɛ', part_of_speech: 'expression', level: 'A1', frequency: 'very_high', themes: '["politeness"]' },
            { id: 'v-oui', french: 'oui', english: 'yes', ipa: 'wi', part_of_speech: 'adverb', level: 'A1', frequency: 'very_high', themes: '["basics"]' },
            { id: 'v-non', french: 'non', english: 'no', ipa: 'nɔ̃', part_of_speech: 'adverb', level: 'A1', frequency: 'very_high', themes: '["basics"]' },
            // A1 - Café vocabulary
            { id: 'v-cafe', french: 'un café', english: 'a coffee', ipa: 'œ̃ ka.fe', part_of_speech: 'noun', gender: 'masculine', level: 'A1', frequency: 'very_high', themes: '["cafe","food"]' },
            { id: 'v-the', french: 'un thé', english: 'a tea', ipa: 'œ̃ te', part_of_speech: 'noun', gender: 'masculine', level: 'A1', frequency: 'high', themes: '["cafe","food"]' },
            { id: 'v-croissant', french: 'un croissant', english: 'a croissant', ipa: 'œ̃ kʁwa.sɑ̃', part_of_speech: 'noun', gender: 'masculine', level: 'A1', frequency: 'high', themes: '["cafe","food"]' },
            { id: 'v-eau', french: "l'eau", english: 'water', ipa: 'lo', part_of_speech: 'noun', gender: 'feminine', level: 'A1', frequency: 'very_high', themes: '["cafe","food"]' },
            { id: 'v-addition', french: "l'addition", english: 'the bill', ipa: 'la.di.sjɔ̃', part_of_speech: 'noun', gender: 'feminine', level: 'A1', frequency: 'high', themes: '["cafe","restaurant"]' },
            // A1 - Numbers
            { id: 'v-un', french: 'un', english: 'one', ipa: 'œ̃', part_of_speech: 'number', level: 'A1', frequency: 'very_high', themes: '["numbers"]' },
            { id: 'v-deux', french: 'deux', english: 'two', ipa: 'dø', part_of_speech: 'number', level: 'A1', frequency: 'very_high', themes: '["numbers"]' },
            { id: 'v-trois', french: 'trois', english: 'three', ipa: 'tʁwa', part_of_speech: 'number', level: 'A1', frequency: 'very_high', themes: '["numbers"]' },
            // A1 - Common verbs
            { id: 'v-etre', french: 'être', english: 'to be', ipa: 'ɛtʁ', part_of_speech: 'verb', level: 'A1', frequency: 'very_high', themes: '["verbs"]' },
            { id: 'v-avoir', french: 'avoir', english: 'to have', ipa: 'a.vwaʁ', part_of_speech: 'verb', level: 'A1', frequency: 'very_high', themes: '["verbs"]' },
            { id: 'v-aller', french: 'aller', english: 'to go', ipa: 'a.le', part_of_speech: 'verb', level: 'A1', frequency: 'very_high', themes: '["verbs"]' },
            { id: 'v-vouloir', french: 'vouloir', english: 'to want', ipa: 'vu.lwaʁ', part_of_speech: 'verb', level: 'A1', frequency: 'very_high', themes: '["verbs"]' },
            { id: 'v-pouvoir', french: 'pouvoir', english: 'to be able to/can', ipa: 'pu.vwaʁ', part_of_speech: 'verb', level: 'A1', frequency: 'very_high', themes: '["verbs"]' },
            // A2 - Travel
            { id: 'v-train', french: 'le train', english: 'the train', ipa: 'lə tʁɛ̃', part_of_speech: 'noun', gender: 'masculine', level: 'A2', frequency: 'high', themes: '["travel"]' },
            { id: 'v-gare', french: 'la gare', english: 'the train station', ipa: 'la ɡaʁ', part_of_speech: 'noun', gender: 'feminine', level: 'A2', frequency: 'high', themes: '["travel"]' },
            { id: 'v-billet', french: 'le billet', english: 'the ticket', ipa: 'lə bi.jɛ', part_of_speech: 'noun', gender: 'masculine', level: 'A2', frequency: 'high', themes: '["travel"]' },
            { id: 'v-hotel', french: "l'hôtel", english: 'the hotel', ipa: 'lo.tɛl', part_of_speech: 'noun', gender: 'masculine', level: 'A2', frequency: 'high', themes: '["travel"]' },
            // A2 - Health
            { id: 'v-medecin', french: 'le médecin', english: 'the doctor', ipa: 'lə med.sɛ̃', part_of_speech: 'noun', gender: 'masculine', level: 'A2', frequency: 'high', themes: '["health"]' },
            { id: 'v-pharmacie', french: 'la pharmacie', english: 'the pharmacy', ipa: 'la faʁ.ma.si', part_of_speech: 'noun', gender: 'feminine', level: 'A2', frequency: 'high', themes: '["health"]' },
            { id: 'v-malade', french: 'malade', english: 'sick', ipa: 'ma.lad', part_of_speech: 'adjective', level: 'A2', frequency: 'high', themes: '["health"]' },
        ];
        const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO vocabulary (id, french, english, ipa, part_of_speech, gender, level, frequency, themes)
      VALUES (@id, @french, @english, @ipa, @part_of_speech, @gender, @level, @frequency, @themes)
    `);
        for (const word of vocabulary) {
            stmt.run({ ...word, gender: word.gender || null });
        }
    }
    seedGrammarRules() {
        const rules = [
            {
                id: 'gr-articles-definite',
                title: 'Definite Articles (The)',
                title_fr: 'Les articles définis',
                category: 'articles',
                level: 'A1',
                explanation: JSON.stringify({
                    whatItMeans: 'French has 4 words for "the" based on the noun\'s gender and number.',
                    whenToUse: 'Use when talking about specific things everyone knows about.',
                    howToForm: 'le (masculine), la (feminine), l\' (before vowel), les (plural)',
                }),
                examples: JSON.stringify([
                    { french: 'le chat', english: 'the cat (masculine)' },
                    { french: 'la maison', english: 'the house (feminine)' },
                    { french: "l'école", english: 'the school (before vowel)' },
                    { french: 'les enfants', english: 'the children (plural)' },
                ]),
                common_traps: JSON.stringify([
                    { trap: 'Forgetting to use l\' before vowels', fix: 'Always check if the word starts with a vowel' },
                ]),
                tags: '["articles","basic","gender"]',
            },
            {
                id: 'gr-passe-compose-avoir',
                title: 'Passé Composé with Avoir',
                title_fr: 'Le passé composé avec avoir',
                category: 'tenses',
                level: 'A2',
                explanation: JSON.stringify({
                    whatItMeans: 'The passé composé describes completed actions in the past.',
                    whenToUse: 'Use for actions that happened and finished: "I ate", "She spoke"',
                    howToForm: 'Subject + avoir (conjugated) + past participle',
                }),
                examples: JSON.stringify([
                    { french: "J'ai mangé", english: 'I ate' },
                    { french: 'Elle a parlé', english: 'She spoke' },
                    { french: 'Nous avons fini', english: 'We finished' },
                ]),
                common_traps: JSON.stringify([
                    { trap: 'Using être instead of avoir', fix: 'Most verbs use avoir. Être is for movement/state verbs.' },
                ]),
                tags: '["tense","past","avoir","compound"]',
            },
            {
                id: 'gr-gender-nouns',
                title: 'Noun Gender',
                title_fr: 'Le genre des noms',
                category: 'nouns',
                level: 'A1',
                explanation: JSON.stringify({
                    whatItMeans: 'Every French noun is either masculine or feminine.',
                    whenToUse: 'You need to know the gender to use the right articles and adjectives.',
                    howToForm: 'Learn each noun with its article: un/le (masculine), une/la (feminine)',
                }),
                examples: JSON.stringify([
                    { french: 'le livre (m)', english: 'the book' },
                    { french: 'la table (f)', english: 'the table' },
                    { french: 'un garçon (m)', english: 'a boy' },
                    { french: 'une fille (f)', english: 'a girl' },
                ]),
                common_traps: JSON.stringify([
                    { trap: 'Guessing based on meaning', fix: 'Gender is often arbitrary. Memorize with the article!' },
                ]),
                tags: '["nouns","gender","basic"]',
            },
        ];
        const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO grammar_rules (id, title, title_fr, category, level, explanation, examples, common_traps, tags)
      VALUES (@id, @title, @title_fr, @category, @level, @explanation, @examples, @common_traps, @tags)
    `);
        for (const rule of rules) {
            stmt.run(rule);
        }
    }
    getDb() {
        if (!this.db)
            throw new Error('Database not initialized');
        return this.db;
    }
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.js.map