import Database from 'better-sqlite3';
declare class DatabaseService {
    private static instance;
    private db;
    private constructor();
    static getInstance(): DatabaseService;
    initialize(): void;
    private createTables;
    private seedInitialData;
    private seedVocabulary;
    private seedGrammarRules;
    getDb(): Database.Database;
    close(): void;
}
export { DatabaseService };
//# sourceMappingURL=database.d.ts.map