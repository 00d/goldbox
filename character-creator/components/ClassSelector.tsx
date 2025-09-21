'use client';

import { CharacterClass } from '@/types/character';
import { classes } from '@/data/classes';

interface ClassSelectorProps {
  selectedClass: CharacterClass | '';
  onChange: (charClass: CharacterClass) => void;
}

export default function ClassSelector({ selectedClass, onChange }: ClassSelectorProps) {
  const classKeys = Object.keys(classes) as CharacterClass[];

  return (
    <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--border)]">
      <h2 className="text-2xl font-bold mb-4 text-[var(--primary)]">Class</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {classKeys.map((classKey) => {
          const charClass = classes[classKey];
          const isSelected = selectedClass === classKey;

          return (
            <button
              key={classKey}
              onClick={() => onChange(classKey)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                  : 'border-[var(--border)] hover:border-[var(--primary)]/50'
              }`}
            >
              <h3 className="font-bold text-lg mb-2">{charClass.name}</h3>

              <div className="text-sm space-y-1">
                <div className="text-gray-400">
                  Hit Die: <span className="text-[var(--secondary)]">d{charClass.hitDie}</span>
                </div>
                <div className="text-gray-400">
                  Skill Points: <span className="text-[var(--foreground)]">{charClass.skillPoints}</span>
                </div>
                <div className="text-gray-400">
                  BAB: <span className="text-[var(--accent)]">{charClass.baseAttackBonus}</span>
                </div>
              </div>

              <div className="mt-2 flex gap-1 text-xs">
                <span className={`px-2 py-1 rounded ${charClass.fortitudeSave === 'good' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                  Fort
                </span>
                <span className={`px-2 py-1 rounded ${charClass.reflexSave === 'good' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                  Ref
                </span>
                <span className={`px-2 py-1 rounded ${charClass.willSave === 'good' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                  Will
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedClass && (
        <div className="bg-[var(--input-bg)] rounded-lg p-4 border border-[var(--border)]">
          <h3 className="font-semibold mb-3 text-[var(--accent)]">
            {classes[selectedClass].name} Class Features
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-[var(--primary)] mb-2">
                Special Abilities (1st Level):
              </h4>
              <ul className="space-y-1">
                {classes[selectedClass].specialAbilities.map((ability, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-[var(--primary)] mt-1">•</span>
                    <span className="text-gray-300">{ability}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-[var(--primary)] mb-2">
                Class Skills:
              </h4>
              <div className="flex flex-wrap gap-2">
                {classes[selectedClass].classSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Hit Die:</span>
                <span className="ml-2 text-[var(--secondary)] font-bold">
                  d{classes[selectedClass].hitDie}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Skill Points/Level:</span>
                <span className="ml-2 text-[var(--foreground)] font-bold">
                  {classes[selectedClass].skillPoints} + Int modifier
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}