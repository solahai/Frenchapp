// Content Routes (Vocabulary, Grammar, Culture)

import { Router, Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database';
import { openAIService } from '../services/openai';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const getDb = () => DatabaseService.getInstance().getDb();

// GET /content/vocabulary
router.get('/vocabulary', (req: Request, res: Response, next: NextFunction) => {
  try {
    const level = req.query.level as string;
    const theme = req.query.theme as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    let query = 'SELECT * FROM vocabulary WHERE 1=1';
    const params: any[] = [];

    if (level) {
      query += ' AND level = ?';
      params.push(level);
    }

    if (theme) {
      query += ' AND themes LIKE ?';
      params.push(`%${theme}%`);
    }

    query += ' ORDER BY frequency DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const vocabulary = getDb().prepare(query).all(...params) as any[];

    res.json({
      success: true,
      data: vocabulary.map(v => ({
        id: v.id,
        french: v.french,
        english: v.english,
        ipa: v.ipa,
        partOfSpeech: v.part_of_speech,
        gender: v.gender,
        level: v.level,
        frequency: v.frequency,
        themes: JSON.parse(v.themes || '[]'),
        examples: v.examples ? JSON.parse(v.examples) : [],
        audioUrl: v.audio_url,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /content/vocabulary/:id
router.get('/vocabulary/:id', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { id } = req.params;

    const vocab = getDb().prepare('SELECT * FROM vocabulary WHERE id = ?').get(id) as any;

    if (!vocab) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Vocabulary item not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: vocab.id,
        french: vocab.french,
        english: vocab.english,
        ipa: vocab.ipa,
        partOfSpeech: vocab.part_of_speech,
        gender: vocab.gender,
        level: vocab.level,
        frequency: vocab.frequency,
        themes: JSON.parse(vocab.themes || '[]'),
        examples: vocab.examples ? JSON.parse(vocab.examples) : [],
        conjugations: vocab.conjugations ? JSON.parse(vocab.conjugations) : null,
        audioUrl: vocab.audio_url,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /content/grammar
router.get('/grammar', (req: Request, res: Response, next: NextFunction) => {
  try {
    const level = req.query.level as string;
    const category = req.query.category as string;

    let query = 'SELECT * FROM grammar_rules WHERE 1=1';
    const params: any[] = [];

    if (level) {
      query += ' AND level = ?';
      params.push(level);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY level, category';

    const rules = getDb().prepare(query).all(...params) as any[];

    res.json({
      success: true,
      data: rules.map(r => ({
        id: r.id,
        title: r.title,
        titleFr: r.title_fr,
        category: r.category,
        level: r.level,
        explanation: JSON.parse(r.explanation || '{}'),
        examples: r.examples ? JSON.parse(r.examples) : [],
        commonTraps: r.common_traps ? JSON.parse(r.common_traps) : [],
        tags: r.tags ? JSON.parse(r.tags) : [],
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /content/grammar/:id
router.get('/grammar/:id', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { id } = req.params;

    const rule = getDb().prepare('SELECT * FROM grammar_rules WHERE id = ?').get(id) as any;

    if (!rule) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Grammar rule not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: rule.id,
        title: rule.title,
        titleFr: rule.title_fr,
        category: rule.category,
        level: rule.level,
        explanation: JSON.parse(rule.explanation || '{}'),
        examples: rule.examples ? JSON.parse(rule.examples) : [],
        commonTraps: rule.common_traps ? JSON.parse(rule.common_traps) : [],
        quickChecks: rule.quick_checks ? JSON.parse(rule.quick_checks) : [],
        tags: rule.tags ? JSON.parse(rule.tags) : [],
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /content/grammar/explain
router.post('/grammar/explain', aiRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { topic, level, question } = req.body;

    if (!topic) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Topic required' },
      });
      return;
    }

    const explanation = await openAIService.explainGrammar(
      topic,
      level || 'A1',
      question
    );

    res.json({
      success: true,
      data: {
        explanation: explanation.whatItMeans,
        whenToUse: explanation.whenToUse,
        howToForm: explanation.howToForm,
        examples: explanation.examples,
        commonMistakes: explanation.commonMistakes,
        quickCheck: explanation.quickCheck,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /content/culture
router.get('/culture', (req: Request, res: Response, next: NextFunction) => {
  try {
    const level = req.query.level as string;
    const type = req.query.type as string;
    const limit = parseInt(req.query.limit as string) || 20;

    let query = 'SELECT * FROM cultural_content WHERE 1=1';
    const params: any[] = [];

    if (level) {
      query += ' AND level = ?';
      params.push(level);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const content = getDb().prepare(query).all(...params) as any[];

    res.json({
      success: true,
      data: content.map(c => ({
        id: c.id,
        type: c.type,
        title: c.title,
        titleFr: c.title_fr,
        description: c.description,
        level: c.level,
        content: JSON.parse(c.content || '{}'),
        vocabulary: c.vocabulary ? JSON.parse(c.vocabulary) : [],
        themes: c.themes ? JSON.parse(c.themes) : [],
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /content/culture/nugget
router.get('/culture/nugget', (req: Request, res: Response, next: NextFunction) => {
  try {
    const level = (req.query.level as string) || 'A1';

    // Get a random cultural nugget for the level
    const nuggets = [
      {
        level: 'A1',
        topic: 'etiquette',
        title: 'La Bise',
        content: 'In France, friends greet each other with "la bise" - light kisses on the cheeks. The number varies by region: 2 in Paris, up to 4 in some areas!',
        relatedVocabulary: ['la bise', 'embrasser', 'saluer'],
        funFact: 'During COVID-19, French people invented new greeting alternatives like elbow bumps!',
      },
      {
        level: 'A1',
        topic: 'food',
        title: 'Le Pain',
        content: 'The French take bread seriously! A traditional baguette must be made with only flour, water, salt, and yeast. French people buy fresh bread daily.',
        relatedVocabulary: ['le pain', 'la baguette', 'la boulangerie'],
        funFact: 'France has laws regulating what can be called a "baguette de tradition française"!',
      },
      {
        level: 'A2',
        topic: 'daily_life',
        title: 'Le Déjeuner',
        content: 'French lunch breaks can last 1-2 hours. Many shops close between 12-2pm. Eating at your desk is considered unusual and unhealthy.',
        relatedVocabulary: ['le déjeuner', 'la pause', 'le restaurant'],
        funFact: 'The French spend more time eating than any other OECD country!',
      },
    ];

    const levelNuggets = nuggets.filter(n => n.level === level);
    const nugget = levelNuggets[Math.floor(Math.random() * levelNuggets.length)] || nuggets[0];

    res.json({
      success: true,
      data: nugget,
    });
  } catch (error) {
    next(error);
  }
});

// GET /content/themes
router.get('/themes', (_req: Request, res: Response) => {
  const themes = [
    { id: 'greetings', name: 'Greetings & Politeness', nameFr: 'Salutations et politesse', level: 'A1', color: '#4CAF50' },
    { id: 'cafe_restaurant', name: 'Café & Restaurant', nameFr: 'Café et restaurant', level: 'A1', color: '#795548' },
    { id: 'shopping', name: 'Shopping', nameFr: 'Faire les courses', level: 'A1', color: '#E91E63' },
    { id: 'family', name: 'Family & Relationships', nameFr: 'Famille et relations', level: 'A1', color: '#9C27B0' },
    { id: 'home', name: 'Home & Living', nameFr: 'La maison', level: 'A1', color: '#FF9800' },
    { id: 'travel', name: 'Travel & Transportation', nameFr: 'Voyages et transports', level: 'A2', color: '#2196F3' },
    { id: 'health', name: 'Health & Body', nameFr: 'Santé et corps', level: 'A2', color: '#F44336' },
    { id: 'work', name: 'Work & Professions', nameFr: 'Travail et métiers', level: 'A2', color: '#607D8B' },
    { id: 'nature', name: 'Nature & Weather', nameFr: 'Nature et météo', level: 'A2', color: '#4CAF50' },
    { id: 'culture', name: 'Culture & Entertainment', nameFr: 'Culture et divertissement', level: 'B1', color: '#9C27B0' },
  ];

  res.json({
    success: true,
    data: themes,
  });
});

export default router;
