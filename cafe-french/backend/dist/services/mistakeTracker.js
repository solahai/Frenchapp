"use strict";
// Mistake Tracker Service
// Implements the "Error Genome" system for personalized remediation
Object.defineProperty(exports, "__esModule", { value: true });
exports.MistakeTracker = exports.mistakeTracker = void 0;
const database_1 = require("./database");
const openai_1 = require("./openai");
const uuid_1 = require("uuid");
class MistakeTracker {
    constructor() {
        this._db = null;
        // Graduation criteria
        this.graduationWeeks = 3;
        this.minCorrectUsages = 5;
        this.minDifferentContexts = 3;
    }
    get db() {
        if (!this._db) {
            this._db = database_1.DatabaseService.getInstance().getDb();
        }
        return this._db;
    }
    /**
     * Get or create mistake profile for a user
     */
    getProfile(userId) {
        const row = this.db.prepare(`
      SELECT * FROM mistake_profiles WHERE user_id = ?
    `).get(userId);
        if (!row) {
            return this.createProfile(userId);
        }
        return {
            userId: row.user_id,
            grammarErrors: JSON.parse(row.grammar_errors || '[]'),
            vocabularyConfusions: JSON.parse(row.vocabulary_confusions || '[]'),
            pronunciationErrors: JSON.parse(row.pronunciation_errors || '[]'),
            graduatedErrors: JSON.parse(row.graduated_errors || '[]'),
            totalErrorsTracked: this.calculateTotalErrors(row),
            lastUpdated: new Date(row.updated_at),
        };
    }
    /**
     * Create a new mistake profile
     */
    createProfile(userId) {
        const id = `mp_${(0, uuid_1.v4)()}`;
        const now = new Date().toISOString();
        this.db.prepare(`
      INSERT INTO mistake_profiles (id, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run(id, userId, now, now);
        return {
            userId,
            grammarErrors: [],
            vocabularyConfusions: [],
            pronunciationErrors: [],
            graduatedErrors: [],
            totalErrorsTracked: 0,
            lastUpdated: new Date(),
        };
    }
    /**
     * Record a grammar error
     */
    recordGrammarError(userId, category, userInput, expectedOutput, explanation, context, level) {
        const profile = this.getProfile(userId);
        const now = new Date();
        // Find or create error cluster
        let cluster = profile.grammarErrors.find(e => e.category === category);
        if (!cluster) {
            cluster = {
                id: `ge_${(0, uuid_1.v4)()}`,
                category,
                level,
                instances: [],
                totalOccurrences: 0,
                occurrencesLast7Days: 0,
                firstOccurrence: now,
                lastOccurrence: now,
                status: 'new',
                graduationProgress: 0,
                weeksWithoutError: 0,
            };
            profile.grammarErrors.push(cluster);
        }
        // Add new instance
        cluster.instances.push({
            id: `ei_${(0, uuid_1.v4)()}`,
            timestamp: now,
            userInput,
            expectedOutput,
            explanation,
            context,
            wasAddressed: false,
        });
        cluster.totalOccurrences++;
        cluster.lastOccurrence = now;
        cluster.weeksWithoutError = 0;
        // Update 7-day count
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        cluster.occurrencesLast7Days = cluster.instances.filter(i => new Date(i.timestamp) >= sevenDaysAgo).length;
        // Update status
        cluster.status = this.determineErrorStatus(cluster);
        // Save to database
        this.saveProfile(profile);
    }
    /**
     * Record a vocabulary confusion
     */
    recordVocabularyConfusion(userId, word1, word2, confusionType, context) {
        const profile = this.getProfile(userId);
        // Find or create confusion record
        let confusion = profile.vocabularyConfusions.find(c => (c.word1 === word1 && c.word2 === word2) ||
            (c.word1 === word2 && c.word2 === word1));
        if (!confusion) {
            confusion = {
                id: `vc_${(0, uuid_1.v4)()}`,
                word1,
                word2,
                confusionType,
                instances: [],
                totalConfusions: 0,
                status: 'new',
                differentiationTip: this.generateDifferentiationTip(word1, word2, confusionType),
            };
            profile.vocabularyConfusions.push(confusion);
        }
        confusion.instances.push({
            timestamp: new Date(),
            context,
        });
        confusion.totalConfusions++;
        confusion.status = confusion.totalConfusions >= 3 ? 'recurring' : 'new';
        this.saveProfile(profile);
    }
    /**
     * Record a pronunciation error
     */
    recordPronunciationError(userId, phoneme, ipa, word, score, substitution) {
        const profile = this.getProfile(userId);
        let cluster = profile.pronunciationErrors.find(e => e.phoneme === phoneme);
        if (!cluster) {
            cluster = {
                id: `pe_${(0, uuid_1.v4)()}`,
                phoneme,
                ipa,
                instances: [],
                totalOccurrences: 0,
                status: 'new',
                averageScore: 0,
                targetSound: phoneme,
                commonSubstitution: substitution || '',
            };
            profile.pronunciationErrors.push(cluster);
        }
        cluster.instances.push({
            timestamp: new Date(),
            word,
            score,
        });
        cluster.totalOccurrences++;
        // Recalculate average score
        const recentScores = cluster.instances.slice(-10).map(i => i.score);
        cluster.averageScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        // Update status based on score trend
        if (cluster.averageScore < 50) {
            cluster.status = 'recurring';
        }
        else if (cluster.averageScore < 70) {
            cluster.status = 'improving';
        }
        else if (cluster.averageScore >= 85) {
            cluster.status = 'monitoring';
        }
        this.saveProfile(profile);
    }
    /**
     * Record a correct usage (for graduation tracking)
     */
    recordCorrectUsage(userId, errorId) {
        const profile = this.getProfile(userId);
        // Find the error across all types
        const grammarError = profile.grammarErrors.find(e => e.id === errorId);
        if (grammarError) {
            grammarError.graduationProgress = Math.min(100, grammarError.graduationProgress + 20);
            if (grammarError.graduationProgress >= 100 && grammarError.weeksWithoutError >= this.graduationWeeks) {
                this.graduateError(profile, errorId, 'grammar');
            }
        }
        this.saveProfile(profile);
    }
    /**
     * Generate weekly remediation workout
     */
    async generateRemediationWorkout(userId, maxMinutes = 12) {
        const profile = this.getProfile(userId);
        // Prioritize errors
        const prioritizedErrors = this.prioritizeErrors(profile);
        const targetErrors = prioritizedErrors.slice(0, 5);
        const exercises = [];
        for (const error of targetErrors) {
            if (error.type === 'grammar') {
                const aiExercises = await openai_1.openAIService.generateRemediationExercises(error.category, error.examples, error.level);
                exercises.push(...aiExercises.map(ex => ({
                    id: `re_${(0, uuid_1.v4)()}`,
                    type: ex.type,
                    targetErrorId: error.id,
                    instructions: ex.instruction,
                    items: ex.items,
                })));
            }
            // Add vocabulary and pronunciation exercises similarly
        }
        const workout = {
            id: `rw_${(0, uuid_1.v4)()}`,
            userId,
            targetErrors: targetErrors.map(e => e.id),
            exercises: exercises.slice(0, Math.ceil(maxMinutes / 2)), // ~2 min per exercise
            estimatedMinutes: Math.min(maxMinutes, exercises.length * 2),
        };
        return workout;
    }
    /**
     * Get top recurring errors for display
     */
    getTopRecurringErrors(userId, limit = 5) {
        const profile = this.getProfile(userId);
        const errors = [];
        // Add grammar errors
        for (const error of profile.grammarErrors) {
            if (error.status !== 'graduated') {
                errors.push({
                    id: error.id,
                    type: 'grammar',
                    description: error.category,
                    occurrences: error.totalOccurrences,
                    trend: this.calculateTrend(error.instances.map(i => new Date(i.timestamp))),
                });
            }
        }
        // Add vocabulary confusions
        for (const confusion of profile.vocabularyConfusions) {
            if (confusion.status !== 'graduated') {
                errors.push({
                    id: confusion.id,
                    type: 'vocabulary',
                    description: `${confusion.word1} vs ${confusion.word2}`,
                    occurrences: confusion.totalConfusions,
                    trend: this.calculateTrend(confusion.instances.map(i => new Date(i.timestamp))),
                });
            }
        }
        // Add pronunciation errors
        for (const error of profile.pronunciationErrors) {
            if (error.status !== 'graduated') {
                errors.push({
                    id: error.id,
                    type: 'pronunciation',
                    description: `Sound: ${error.phoneme} (${error.ipa})`,
                    occurrences: error.totalOccurrences,
                    trend: this.calculateTrend(error.instances.map(i => new Date(i.timestamp))),
                });
            }
        }
        // Sort by occurrences and return top N
        return errors
            .sort((a, b) => b.occurrences - a.occurrences)
            .slice(0, limit);
    }
    /**
     * Weekly update to check graduation and update statistics
     */
    weeklyUpdate(userId) {
        const profile = this.getProfile(userId);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        for (const error of profile.grammarErrors) {
            // Check if any instances in the last week
            const recentInstances = error.instances.filter(i => new Date(i.timestamp) >= oneWeekAgo);
            if (recentInstances.length === 0) {
                error.weeksWithoutError++;
                // Check for graduation
                if (error.weeksWithoutError >= this.graduationWeeks && error.graduationProgress >= 80) {
                    this.graduateError(profile, error.id, 'grammar');
                }
            }
            // Update 7-day count
            error.occurrencesLast7Days = recentInstances.length;
            error.status = this.determineErrorStatus(error);
        }
        this.saveProfile(profile);
    }
    // Private helper methods
    saveProfile(profile) {
        this.db.prepare(`
      UPDATE mistake_profiles SET
        grammar_errors = ?,
        vocabulary_confusions = ?,
        pronunciation_errors = ?,
        graduated_errors = ?,
        updated_at = ?
      WHERE user_id = ?
    `).run(JSON.stringify(profile.grammarErrors), JSON.stringify(profile.vocabularyConfusions), JSON.stringify(profile.pronunciationErrors), JSON.stringify(profile.graduatedErrors), new Date().toISOString(), profile.userId);
    }
    calculateTotalErrors(row) {
        const grammar = JSON.parse(row.grammar_errors || '[]');
        const vocab = JSON.parse(row.vocabulary_confusions || '[]');
        const pronunciation = JSON.parse(row.pronunciation_errors || '[]');
        return grammar.reduce((sum, e) => sum + e.totalOccurrences, 0) +
            vocab.reduce((sum, e) => sum + e.totalConfusions, 0) +
            pronunciation.reduce((sum, e) => sum + e.totalOccurrences, 0);
    }
    determineErrorStatus(cluster) {
        if (cluster.weeksWithoutError >= this.graduationWeeks)
            return 'monitoring';
        if (cluster.occurrencesLast7Days === 0 && cluster.totalOccurrences > 3)
            return 'improving';
        if (cluster.occurrencesLast7Days >= 3)
            return 'recurring';
        if (cluster.totalOccurrences <= 2)
            return 'new';
        return 'recurring';
    }
    graduateError(profile, errorId, type) {
        profile.graduatedErrors.push(errorId);
        if (type === 'grammar') {
            const error = profile.grammarErrors.find(e => e.id === errorId);
            if (error)
                error.status = 'graduated';
        }
        // Handle other types similarly
    }
    generateDifferentiationTip(word1, word2, type) {
        // This would ideally use AI, but here's a simple fallback
        const tips = {
            'spelling_similar': `Remember: "${word1}" and "${word2}" look similar but mean different things. Focus on the different letters.`,
            'pronunciation_similar': `Practice saying "${word1}" and "${word2}" slowly, exaggerating the different sounds.`,
            'meaning_similar': `Think about the specific context: "${word1}" is used when..., while "${word2}" is used when...`,
        };
        return tips[type] || `Pay attention to the difference between "${word1}" and "${word2}".`;
    }
    prioritizeErrors(profile) {
        const errors = [];
        for (const error of profile.grammarErrors) {
            if (error.status !== 'graduated') {
                errors.push({
                    id: error.id,
                    type: 'grammar',
                    category: error.category,
                    examples: error.instances.slice(-3).map(i => i.userInput),
                    level: error.level,
                    priority: error.occurrencesLast7Days * 10 + error.totalOccurrences,
                });
            }
        }
        return errors.sort((a, b) => b.priority - a.priority);
    }
    calculateTrend(dates) {
        if (dates.length < 3)
            return 'stable';
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const lastWeek = dates.filter(d => d >= oneWeekAgo).length;
        const previousWeek = dates.filter(d => d >= twoWeeksAgo && d < oneWeekAgo).length;
        if (lastWeek > previousWeek * 1.5)
            return 'increasing';
        if (lastWeek < previousWeek * 0.5)
            return 'decreasing';
        return 'stable';
    }
}
exports.MistakeTracker = MistakeTracker;
exports.mistakeTracker = new MistakeTracker();
//# sourceMappingURL=mistakeTracker.js.map