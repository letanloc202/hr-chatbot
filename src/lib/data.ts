import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface Employee {
  name: string;
  position: string;
  department: string;
  remainingLeaveDays: number;
  totalLeaveDays: number;
  hireDate: string;
  employeeId: string;
}

export interface LeaveCase {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  type: string;
  note: string;
  status: string;
  createdAt: string;
  employeeId: string;
}

export interface PolicyChunk {
  id: string;
  text: string;
  embedding: number[];
}

export interface PolicyIndex {
  model: string;
  dim: number;
  chunks: PolicyChunk[];
  updatedAt: string;
}

// Safe file operations
export async function readJsonFile<T>(filename: string): Promise<T> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw new Error(`Failed to read ${filename}`);
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const tempPath = filePath + '.tmp';
    
    // Write to temporary file first
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
    
    // Atomic move
    await fs.rename(tempPath, filePath);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw new Error(`Failed to write ${filename}`);
  }
}

export async function appendToJsonFile<T>(filename: string, newItem: T): Promise<void> {
  try {
    const existingData = await readJsonFile<T[]>(filename);
    existingData.push(newItem);
    await writeJsonFile(filename, existingData);
  } catch (error) {
    console.error(`Error appending to ${filename}:`, error);
    throw new Error(`Failed to append to ${filename}`);
  }
}

export async function readTextFile(filename: string): Promise<string> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw new Error(`Failed to read ${filename}`);
  }
}
