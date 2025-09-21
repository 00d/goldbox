'use client';

import { useState } from 'react';
import { CharacterClass } from '@/types/character';
import { classes } from '@/data/classes';

interface ClassSelectorProps {
  selectedClass: CharacterClass | '';
  onChange: (charClass: CharacterClass) => void;
}

export default function ClassSelector({ selectedClass, onChange }: ClassSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const classKeys = Object.keys(classes) as CharacterClass[];

  const filteredClasses = classKeys.filter((classKey) => {
    const charClass = classes[classKey];
    return charClass.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
      </div>

      {selectedClass && (
        <div className="mb-4 p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--primary)]">
          <h3 className="font-semibold mb-2 text-[var(--accent)]">Selected Class</h3>
          <div className="flex items-center justify-between">
            <span className="font-medium">{classes[selectedClass].name}</span>
            <button
              onClick={() => onChange('' as CharacterClass)}
              className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)]"
            >
              Change
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {filteredClasses.map((classKey) => {
          const charClass = classes[classKey];
          const isSelected = selectedClass === classKey;

          return (
            <button
              key={classKey}
              onClick={() => onChange(classKey)}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-[var(--primary)]/10 border-[var(--primary)]'
                  : 'bg-[var(--input-bg)] border-[var(--border)] hover:border-[var(--primary)]/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{charClass.name}</h3>

                  <div className="text-sm space-y-1 mb-3">
                    <div className="text-gray-400">
                      Hit Die: <span className="text-[var(--secondary)]">d{charClass.hitDie}</span>
                    </div>
                    <div className="text-gray-400">
                      Skill Points: <span className="text-[var(--foreground)]">{charClass.skillPoints} + Int modifier</span>
                    </div>
                    <div className="text-gray-400">
                      BAB: <span className="text-[var(--accent)]">{charClass.baseAttackBonus}</span>
                    </div>
                  </div>

                  <div className="mb-3 flex gap-1 text-xs">
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

                  <div className="border-t border-[var(--border)] pt-2">
                    <div className="text-sm mb-2">
                      <span className="font-semibold text-[var(--primary)]">Special Abilities (1st Level):</span>
                    </div>
                    <ul className="space-y-1 mb-3">
                      {charClass.specialAbilities.map((ability, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-[var(--primary)] mt-1">•</span>
                          <span className="text-gray-300">{ability}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-[var(--border)] pt-2">
                    <div className="text-sm mb-2">
                      <span className="font-semibold text-[var(--primary)]">Class Skills:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {charClass.classSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No classes found matching your search.
        </div>
      )}
    </div>
  );
}