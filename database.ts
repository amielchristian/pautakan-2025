// database.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'node:path';

export interface College {
  id?: number;
  score: number;
  imagePath: string;
  name: string;
  shortHand: string;
}

let db: Database | null = null;

export async function initializeDatabase(appRoot: string): Promise<Database> {
  if (db) return db;
  
  const dbPath = path.join(appRoot, 'database.sqlite');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS colleges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      score INTEGER NOT NULL DEFAULT 0,
      imagePath TEXT NOT NULL,
      name TEXT NOT NULL,
      shortHand TEXT NOT NULL UNIQUE
    )
  `);
  
  // Initialize with college data if the table is empty
  const count = await db.get('SELECT COUNT(*) as count FROM colleges');
  if (count.count === 0) {
    const colleges: College[] = [
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/CRS.png',
        name: 'College of Rehabilitation Sciences',
        shortHand: 'CRS'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/ACC.png',
        name: 'College of Accountancy',
        shortHand: 'ACC'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/ARKI.png',
        name: 'College of Architecture',
        shortHand: 'ARKI'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/AB.png',
        name: 'Faculty of Arts and Letters',
        shortHand: 'AB'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/LAW.png',
        name: 'Faculty of Civil Law',
        shortHand: 'LAW'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/COMM.png',
        name: 'College of Commerce and Business Administration',
        shortHand: 'COMM'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/EDUC.png',
        name: 'College of Education',
        shortHand: 'EDUC'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/ENGG.png',
        name: 'Faculty of Engineering',
        shortHand: 'ENGG'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/CICS.png',
        name: 'College of Information and Computing Sciences',
        shortHand: 'CICS'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/MED.png',
        name: 'Faculty of Medicine and Surgery',
        shortHand: 'MED'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/MUSIC.png',
        name: 'Conservatory of Music',
        shortHand: 'MUSIC'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/NURSING.png',
        name: 'College of Nursing',
        shortHand: 'NUR'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/PHARMA.png',
        name: 'Faculty of Pharmacy',
        shortHand: 'PHARMA'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/IPEA.png',
        name: 'Institute of Physical Education and Athletics',
        shortHand: 'IPEA'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/COS.png',
        name: 'College of Science',
        shortHand: 'COS'
      },
      {
        score: 0,
        imagePath: 'public/ICONS FOR RANKING/CTHM.png',
        name: 'College of Tourism and Hospitality Management',
        shortHand: 'CTHM'
      }
    ];
    
    for (const college of colleges) {
      await db.run(
        'INSERT INTO colleges (score, imagePath, name, shortHand) VALUES (?, ?, ?, ?)',
        [college.score, college.imagePath, college.name, college.shortHand]
      );
    }
  }
  
  return db;
}

export async function getAllColleges(): Promise<College[]> {
  if (!db) throw new Error('Database not initialized');
  return db.all('SELECT * FROM colleges ORDER BY score DESC');
}

export async function getCollegeByShortHand(shortHand: string): Promise<College | undefined> {
  if (!db) throw new Error('Database not initialized');
  return db.get('SELECT * FROM colleges WHERE shortHand = ?', shortHand);
}

export async function updateCollegeScore(shortHand: string, score: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.run('UPDATE colleges SET score = ? WHERE shortHand = ?', [score, shortHand]);
}

export async function incrementCollegeScore(shortHand: string, increment: number = 1): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.run('UPDATE colleges SET score = score + ? WHERE shortHand = ?', [increment, shortHand]);
}

export async function resetAllScores(): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.run('UPDATE colleges SET score = 0');
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}