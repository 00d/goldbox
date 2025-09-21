'use client';

import { useState, useEffect } from 'react';
import { Character } from '@/types/character';

interface CharacterListProps {
  onLoadCharacter: (character: Character) => void;
  onClose: () => void;
}

interface SavedCharacter {
  filename: string;
  character: Character;
}

export default function CharacterList({ onLoadCharacter, onClose }: CharacterListProps) {
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/characters');
      const data = await response.json();

      if (response.ok) {
        setCharacters(data.characters);
        setError(null);
      } else {
        setError(data.error || 'Failed to load characters');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (character: Character) => {
    onLoadCharacter(character);
    onClose();
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this character?')) {
      return;
    }

    try {
      const response = await fetch(`/api/characters/${filename}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCharacters();
      } else {
        alert('Failed to delete character');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete character');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border)] max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[var(--primary)]">Saved Characters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[var(--foreground)] text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading characters...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-8">{error}</div>
          ) : characters.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No saved characters found. Create and save a character to see it here.
            </div>
          ) : (
            <div className="space-y-3">
              {characters.map((saved) => (
                <div
                  key={saved.filename}
                  className="p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{saved.character.basicInfo.name}</h3>
                      <div className="text-sm text-gray-400 mt-1">
                        Level {saved.character.basicInfo.level}{' '}
                        {saved.character.basicInfo.race.charAt(0).toUpperCase() +
                          saved.character.basicInfo.race.slice(1)}{' '}
                        {saved.character.basicInfo.class.charAt(0).toUpperCase() +
                          saved.character.basicInfo.class.slice(1)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Player: {saved.character.basicInfo.player}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoad(saved.character)}
                        className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(saved.filename)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[var(--input-bg)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}