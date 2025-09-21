'use client';

import { AbilityScores as AbilityScoresType } from '@/types/character';

interface AbilityScoresProps {
  scores: AbilityScoresType;
  onChange: (scores: AbilityScoresType) => void;
}

const abilityNames: { key: keyof AbilityScoresType; label: string; abbr: string }[] = [
  { key: 'strength', label: 'Strength', abbr: 'STR' },
  { key: 'dexterity', label: 'Dexterity', abbr: 'DEX' },
  { key: 'constitution', label: 'Constitution', abbr: 'CON' },
  { key: 'intelligence', label: 'Intelligence', abbr: 'INT' },
  { key: 'wisdom', label: 'Wisdom', abbr: 'WIS' },
  { key: 'charisma', label: 'Charisma', abbr: 'CHA' },
];

const calculateModifier = (score: number): string => {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

export default function AbilityScores({ scores, onChange }: AbilityScoresProps) {
  const handleScoreChange = (ability: keyof AbilityScoresType, value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(3, Math.min(18, numValue));
    onChange({ ...scores, [ability]: clampedValue });
  };

  return (
    <div>
      <p className="text-sm text-gray-400 mb-6">
        Standard scores range from 3 to 18. Use point buy or roll for initial values.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {abilityNames.map(({ key, label, abbr }) => (
          <div
            key={key}
            className="bg-[var(--input-bg)] rounded-lg p-4 border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <label htmlFor={key} className="font-semibold text-[var(--foreground)]">
                {label}
              </label>
              <span className="text-xs text-gray-400 font-mono">{abbr}</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                id={key}
                type="number"
                min="3"
                max="18"
                value={scores[key]}
                onChange={(e) => handleScoreChange(key, e.target.value)}
                className="w-20 bg-[var(--background)] border border-[var(--border)] rounded px-3 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />

              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Modifier</div>
                  <div className="text-xl font-bold text-[var(--secondary)]">
                    {calculateModifier(scores[key])}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--border)]">
        <h3 className="font-semibold mb-2 text-[var(--accent)]">Point Buy Information</h3>
        <p className="text-sm text-gray-400">
          Standard Point Buy: 25 points. Score costs: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=6, 15=8, 16=10, 17=13, 18=16 points.
        </p>
      </div>
    </div>
  );
}