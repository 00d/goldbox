'use client';

import { useState } from 'react';
import { Template } from '@/types/character';
import { templates, TemplateData } from '@/data/templates';

interface TemplateSelectorProps {
  selectedTemplate: Template | '';
  onChange: (template: Template | '') => void;
}

export default function TemplateSelector({ selectedTemplate, onChange }: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const templateKeys = Object.keys(templates) as Template[];

  const categories = ['all', ...new Set(Object.values(templates).map(t => t.category))];

  const filteredTemplates = templateKeys.filter((templateKey) => {
    const template = templates[templateKey];
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (cat: string) => {
    return cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatAbilityMods = (template: TemplateData) => {
    const mods = Object.entries(template.abilityAdjustments)
      .map(([ability, value]) =>
        `${ability.slice(0, 3).toUpperCase()} ${value > 0 ? '+' : ''}${value}`
      )
      .join(', ');
    return mods || 'None';
  };

  return (
    <div>
      <div className="mb-4 p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--border)] text-sm">
        <p className="text-gray-300">
          Templates are optional modifiers that can be applied to your character, such as Half-Dragon, Vampire, or Lycanthrope.
          They modify ability scores and grant special abilities, but may increase effective character level.
        </p>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : getCategoryLabel(cat)}
            </option>
          ))}
        </select>
      </div>

      {selectedTemplate && templates[selectedTemplate] && (
        <div className="mb-4 p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--primary)]">
          <h3 className="font-semibold mb-2 text-[var(--accent)]">Selected Template</h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{templates[selectedTemplate].name}</span>
              {templates[selectedTemplate].levelAdjustment && (
                <span className="ml-2 text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded">
                  LA +{templates[selectedTemplate].levelAdjustment}
                </span>
              )}
            </div>
            <button
              onClick={() => onChange('')}
              className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)]"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {!selectedTemplate && (
        <div className="mb-4 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)] text-sm text-gray-400">
          No template selected (optional)
        </div>
      )}

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {filteredTemplates.map((templateKey) => {
          const template = templates[templateKey];
          const isSelected = selectedTemplate === templateKey;

          return (
            <button
              key={templateKey}
              onClick={() => onChange(isSelected ? '' : templateKey)}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-[var(--primary)]/10 border-[var(--primary)]'
                  : 'bg-[var(--input-bg)] border-[var(--border)] hover:border-[var(--primary)]/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{template.name}</h3>
                    <span className="text-xs bg-[var(--background)] border border-[var(--border)] px-2 py-0.5 rounded">
                      {getCategoryLabel(template.category)}
                    </span>
                    {template.levelAdjustment && (
                      <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded">
                        LA +{template.levelAdjustment}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 mb-3">{template.description}</p>

                  <div className="text-sm mb-3">
                    <div className="text-gray-400">
                      Ability Mods: <span className="text-[var(--secondary)]">{formatAbilityMods(template)}</span>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-2">
                    <div className="text-sm mb-2">
                      <span className="font-semibold text-[var(--primary)]">Special Abilities:</span>
                    </div>
                    <ul className="space-y-1">
                      {template.specialAbilities.slice(0, 4).map((ability, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-[var(--primary)] mt-1">•</span>
                          <span className="text-gray-300">{ability}</span>
                        </li>
                      ))}
                      {template.specialAbilities.length > 4 && (
                        <li className="text-sm text-gray-500 italic">
                          ...and {template.specialAbilities.length - 4} more
                        </li>
                      )}
                    </ul>
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

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No templates found matching your search.
        </div>
      )}
    </div>
  );
}