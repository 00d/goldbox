'use client';

import { useState } from 'react';
import { Feat } from '@/types/character';
import { commonFeats } from '@/data/feats';

interface FeatsSelectorProps {
  selectedFeats: Feat[];
  availableFeats: number;
  onChange: (feats: Feat[]) => void;
}

export default function FeatsSelector({ selectedFeats, availableFeats, onChange }: FeatsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredFeats = commonFeats.filter((feat) => {
    const matchesSearch = feat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || feat.type === selectedType;
    return matchesSearch && matchesType;
  });

  const isFeatSelected = (featName: string): boolean => {
    return selectedFeats.some((f) => f.name === featName);
  };

  const toggleFeat = (feat: Feat) => {
    if (isFeatSelected(feat.name)) {
      onChange(selectedFeats.filter((f) => f.name !== feat.name));
    } else {
      if (selectedFeats.length < availableFeats) {
        onChange([...selectedFeats, feat]);
      }
    }
  };

  const featTypes = ['all', ...new Set(commonFeats.map((f) => f.type).filter(Boolean))];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-right">
          <div className="text-sm text-gray-400">Available Feats</div>
          <div className="text-xl font-bold">
            <span className={selectedFeats.length > availableFeats ? 'text-red-400' : 'text-[var(--accent)]'}>
              {availableFeats - selectedFeats.length}
            </span>
            <span className="text-gray-400"> / {availableFeats}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--border)] text-sm">
        <p className="text-gray-300">
          At 1st level, characters gain 1 feat. Humans gain an additional bonus feat. Fighters and Wizards gain bonus feats from their class.
        </p>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search feats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          {featTypes.map((type) => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {selectedFeats.length > 0 && (
        <div className="mb-4 p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--primary)]">
          <h3 className="font-semibold mb-2 text-[var(--accent)]">Selected Feats</h3>
          <div className="flex flex-wrap gap-2">
            {selectedFeats.map((feat) => (
              <button
                key={feat.name}
                onClick={() => toggleFeat(feat)}
                className="bg-[var(--primary)] text-white px-3 py-1 rounded-lg text-sm hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-2"
              >
                {feat.name}
                <span className="text-lg leading-none">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {filteredFeats.map((feat) => {
          const isSelected = isFeatSelected(feat.name);
          const canSelect = selectedFeats.length < availableFeats || isSelected;

          return (
            <button
              key={feat.name}
              onClick={() => canSelect && toggleFeat(feat)}
              disabled={!canSelect}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-[var(--primary)]/10 border-[var(--primary)]'
                  : canSelect
                  ? 'bg-[var(--input-bg)] border-[var(--border)] hover:border-[var(--primary)]/50'
                  : 'bg-[var(--input-bg)] border-[var(--border)] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{feat.name}</h3>
                    {feat.type && (
                      <span className="text-xs bg-[var(--background)] border border-[var(--border)] px-2 py-0.5 rounded">
                        {feat.type}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{feat.description}</p>
                  {feat.prerequisites && feat.prerequisites.length > 0 && (
                    <div className="text-xs text-[var(--secondary)]">
                      Prerequisites: {feat.prerequisites.join(', ')}
                    </div>
                  )}
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

      {filteredFeats.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No feats found matching your search.
        </div>
      )}
    </div>
  );
}