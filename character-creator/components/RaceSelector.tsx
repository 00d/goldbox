'use client';

import { Race } from '@/types/character';
import { races } from '@/data/races';

interface RaceSelectorProps {
  selectedRace: Race | '';
  onChange: (race: Race) => void;
}

export default function RaceSelector({ selectedRace, onChange }: RaceSelectorProps) {
  const raceKeys = Object.keys(races) as Race[];

  return (
    <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--border)]">
      <h2 className="text-2xl font-bold mb-4 text-[var(--primary)]">Race</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {raceKeys.map((raceKey) => {
          const race = races[raceKey];
          const isSelected = selectedRace === raceKey;

          return (
            <button
              key={raceKey}
              onClick={() => onChange(raceKey)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                  : 'border-[var(--border)] hover:border-[var(--primary)]/50'
              }`}
            >
              <h3 className="font-bold text-lg mb-2">{race.name}</h3>

              <div className="text-sm space-y-1">
                <div className="text-gray-400">
                  Size: <span className="text-[var(--foreground)]">{race.size}</span>
                </div>
                <div className="text-gray-400">
                  Speed: <span className="text-[var(--foreground)]">{race.speed} ft</span>
                </div>
                {Object.keys(race.abilityAdjustments).length > 0 && (
                  <div className="text-gray-400">
                    Ability Mods:{' '}
                    <span className="text-[var(--secondary)]">
                      {Object.entries(race.abilityAdjustments)
                        .map(([ability, value]) =>
                          `${ability.slice(0, 3).toUpperCase()} ${value > 0 ? '+' : ''}${value}`
                        )
                        .join(', ')}
                    </span>
                  </div>
                )}
                <div className="text-gray-400">
                  Favored: <span className="text-[var(--accent)]">{race.favoredClass}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedRace && (
        <div className="bg-[var(--input-bg)] rounded-lg p-4 border border-[var(--border)]">
          <h3 className="font-semibold mb-3 text-[var(--accent)]">
            {races[selectedRace].name} Special Abilities
          </h3>

          <ul className="space-y-2">
            {races[selectedRace].specialAbilities.map((ability, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-[var(--primary)] mt-1">•</span>
                <span className="text-gray-300">{ability}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold text-[var(--primary)]">Automatic Languages:</span>
                <span className="text-gray-300 ml-2">
                  {races[selectedRace].automaticLanguages.join(', ')}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[var(--primary)]">Bonus Languages:</span>
                <span className="text-gray-300 ml-2">
                  {races[selectedRace].bonusLanguages.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}