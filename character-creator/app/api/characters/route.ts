import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function GET() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const characters = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(DATA_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const character = JSON.parse(content);
        return {
          filename: file,
          character,
        };
      })
    );

    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error reading characters:', error);
    return NextResponse.json({ error: 'Failed to read characters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const character = await request.json();

    await fs.mkdir(DATA_DIR, { recursive: true });

    const filename = `${character.basicInfo.name.replace(/\s+/g, '_') || 'character'}_${Date.now()}.json`;
    const filePath = path.join(DATA_DIR, filename);

    await fs.writeFile(filePath, JSON.stringify(character, null, 2));

    return NextResponse.json({
      success: true,
      filename,
      message: 'Character saved successfully'
    });
  } catch (error) {
    console.error('Error saving character:', error);
    return NextResponse.json({ error: 'Failed to save character' }, { status: 500 });
  }
}