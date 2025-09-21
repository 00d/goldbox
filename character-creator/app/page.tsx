'use client';

import { useState, useRef } from 'react';
import { Character, AbilityScores, Race, CharacterClass, Skill, Feat, Equipment } from '@/types/character';
import AbilityScoresComponent from '@/components/AbilityScores';
import RaceSelector from '@/components/RaceSelector';
import ClassSelector from '@/components/ClassSelector';
import SkillsSelector from '@/components/SkillsSelector';
import FeatsSelector from '@/components/FeatsSelector';
import EquipmentSelector from '@/components/EquipmentSelector';
import CharacterList from '@/components/CharacterList';
import { exportCharacterToJSON, importCharacterFromJSON } from '@/utils/characterUtils';
import { classes } from '@/data/classes';
import { races } from '@/data/races';

const initialAbilityScores: AbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

const initialEquipment: Equipment = {
  weapons: [],
  gear: [],
  money: { platinum: 0, gold: 0, silver: 0, copper: 0 },
};

export default function Home() {
  const [characterName, setCharacterName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedRace, setSelectedRace] = useState<Race | ''>('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | ''>('');
  const [abilityScores, setAbilityScores] = useState<AbilityScores>(initialAbilityScores);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [feats, setFeats] = useState<Feat[]>([]);
  const [equipment, setEquipment] = useState<Equipment>(initialEquipment);
  const [showCharacterList, setShowCharacterList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSkillPoints = (): number => {
    if (!selectedClass) return 0;
    const classData = classes[selectedClass];
    const intModifier = Math.floor((abilityScores.intelligence - 10) / 2);
    let base = classData.skillPoints + intModifier;
    if (selectedRace === 'human') base += 4;
    return Math.max(1, base);
  };

  const getAvailableFeats = (): number => {
    let total = 1;
    if (selectedRace === 'human') total += 1;
    return total;
  };

  const buildCharacter = (): Character => {
    const intModifier = Math.floor((abilityScores.intelligence - 10) / 2);
    const languages = selectedRace ? [...races[selectedRace].automaticLanguages] : ['Common'];

    if (intModifier > 0 && selectedRace) {
      const bonusLanguages = races[selectedRace].bonusLanguages.slice(0, intModifier);
      languages.push(...bonusLanguages);
    }

    return {
      basicInfo: {
        name: characterName || 'Unnamed Character',
        player: playerName || 'Unknown Player',
        race: selectedRace || 'human',
        class: selectedClass || 'fighter',
        level: 1,
        alignment: 'true-neutral',
        size: selectedRace && races[selectedRace] ? races[selectedRace].size : 'medium',
      },
      abilityScores,
      skills,
      feats,
      equipment,
      hitPoints: {
        max: selectedClass ? classes[selectedClass].hitDie : 10,
        current: selectedClass ? classes[selectedClass].hitDie : 10,
      },
      armorClass: {
        total: 10,
        flatFooted: 10,
        touch: 10,
      },
      savingThrows: {
        fortitude: 0,
        reflex: 0,
        will: 0,
      },
      baseAttackBonus: 0,
      specialAbilities: selectedRace && selectedClass
        ? [...races[selectedRace].specialAbilities, ...classes[selectedClass].specialAbilities]
        : [],
      languages,
    };
  };

  const handleSave = () => {
    const character = buildCharacter();
    exportCharacterToJSON(character);
  };

  const handleLoad = () => {
    fileInputRef.current?.click();
  };

  const handleLoadCharacter = (character: Character) => {
    setCharacterName(character.basicInfo.name);
    setPlayerName(character.basicInfo.player);
    setSelectedRace(character.basicInfo.race);
    setSelectedClass(character.basicInfo.class);
    setAbilityScores(character.abilityScores);
    setSkills(character.skills);
    setFeats(character.feats);
    setEquipment(character.equipment);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const character = await importCharacterFromJSON(file);
      handleLoadCharacter(character);
      alert('Character imported successfully!');
    } catch (error) {
      alert('Failed to import character. Please check the file format.');
      console.error(error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--primary)] mb-2">
            D&D 3.5e Character Creator
          </h1>
          <p className="text-gray-400">
            Create your character for D&D 3.5 Edition adventures
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Save Character
          </button>

          <button
            onClick={handleLoad}
            className="px-6 py-3 bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Load Character
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--border)]">
            <h2 className="text-2xl font-bold mb-4 text-[var(--primary)]">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="characterName" className="block text-sm font-medium mb-2">
                  Character Name
                </label>
                <input
                  id="characterName"
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Enter character name"
                  className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="playerName" className="block text-sm font-medium mb-2">
                  Player Name
                </label>
                <input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter player name"
                  className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <RaceSelector selectedRace={selectedRace} onChange={setSelectedRace} />

          <ClassSelector selectedClass={selectedClass} onChange={setSelectedClass} />

          <AbilityScoresComponent scores={abilityScores} onChange={setAbilityScores} />

          <SkillsSelector
            selectedSkills={skills}
            abilityScores={abilityScores}
            characterClass={selectedClass}
            availablePoints={getSkillPoints()}
            onChange={setSkills}
          />

          <FeatsSelector
            selectedFeats={feats}
            availableFeats={getAvailableFeats()}
            onChange={setFeats}
          />

          <EquipmentSelector equipment={equipment} onChange={setEquipment} />
        </div>

        <div className="mt-8 p-6 bg-[var(--card-bg)] rounded-lg border border-[var(--border)]">
          <h2 className="text-2xl font-bold mb-4 text-[var(--primary)]">Character Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Name:</span>
              <span className="ml-2 font-medium">{characterName || 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-400">Player:</span>
              <span className="ml-2 font-medium">{playerName || 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-400">Race:</span>
              <span className="ml-2 font-medium">{selectedRace ? races[selectedRace].name : 'Not selected'}</span>
            </div>
            <div>
              <span className="text-gray-400">Class:</span>
              <span className="ml-2 font-medium">{selectedClass ? classes[selectedClass].name : 'Not selected'}</span>
            </div>
            <div>
              <span className="text-gray-400">Skills Allocated:</span>
              <span className="ml-2 font-medium">{skills.reduce((sum, s) => sum + s.ranks, 0)} / {getSkillPoints()}</span>
            </div>
            <div>
              <span className="text-gray-400">Feats Selected:</span>
              <span className="ml-2 font-medium">{feats.length} / {getAvailableFeats()}</span>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>D&D 3.5e Character Creator | Based on the D&D 3.5 SRD</p>
        </footer>
      </div>
    </div>
  );
}
