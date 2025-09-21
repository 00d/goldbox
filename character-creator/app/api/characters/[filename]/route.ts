import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const DATA_DIR = path.join(os.tmpdir(), 'character-creator-data');

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filePath = path.join(DATA_DIR, params.filename);
    const content = await fs.readFile(filePath, 'utf-8');
    const character = JSON.parse(content);

    return NextResponse.json({ character });
  } catch (error) {
    console.error('Error reading character:', error);
    return NextResponse.json({ error: 'Character not found' }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filePath = path.join(DATA_DIR, params.filename);
    await fs.unlink(filePath);

    return NextResponse.json({
      success: true,
      message: 'Character deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}