import { Character } from '@/types/character';

export const exportCharacterToJSON = async (character: Character): Promise<void> => {
  try {
    const response = await fetch('/api/characters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(character),
    });

    if (!response.ok) {
      throw new Error('Failed to save character');
    }

    const result = await response.json();
    alert(`Character saved successfully: ${result.filename}`);
  } catch (error) {
    console.error('Error saving character:', error);
    alert('Failed to save character');
  }
};

export const importCharacterFromJSON = (file: File): Promise<Character> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const character = JSON.parse(text) as Character;
        resolve(character);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

export const loadCharactersFromServer = async (): Promise<Array<{ filename: string; character: Character }>> => {
  try {
    const response = await fetch('/api/characters');
    if (!response.ok) {
      throw new Error('Failed to load characters');
    }
    const data = await response.json();
    return data.characters || [];
  } catch (error) {
    console.error('Error loading characters:', error);
    return [];
  }
};

export const deleteCharacterFromServer = async (filename: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/characters/${filename}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting character:', error);
    return false;
  }
};