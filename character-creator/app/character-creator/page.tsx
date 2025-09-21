'use client';

import { useState, useRef } from 'react';
import { Character, AbilityScores, Race, Template, CharacterClass, Skill, Feat, Equipment } from '@/types/character';
import AbilityScoresComponent from '@/components/AbilityScores';
import RaceSelector from '@/components/RaceSelector';
import TemplateSelector from '@/components/TemplateSelector';
import ClassSelector from '@/components/ClassSelector';
import SkillsSelector from '@/components/SkillsSelector';
import FeatsSelector from '@/components/FeatsSelector';
import EquipmentSelector from '@/components/EquipmentSelector';
import CharacterList from '@/components/CharacterList';
import { exportCharacterToJSON, importCharacterFromJSON } from '@/utils/characterUtils';
import { classes } from '@/data/classes';
import { races } from '@/data/races';
import { templates } from '@/data/templates';
import { Accordion, AccordionItem } from '@/components/Accordion';

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

export default function CharacterCreator() {
  const [characterName, setCharacterName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedRace, setSelectedRace] = useState<Race | ''>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | ''>('');
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
    const finalAbilityScores: AbilityScores = { ...abilityScores };

    if (selectedRace && races[selectedRace]) {
      const raceAdj = races[selectedRace].abilityAdjustments;
      Object.entries(raceAdj).forEach(([ability, value]) => {
        finalAbilityScores[ability as keyof AbilityScores] += value;
      });
    }

    if (selectedTemplate && templates[selectedTemplate]) {
      const templateAdj = templates[selectedTemplate].abilityAdjustments;
      Object.entries(templateAdj).forEach(([ability, value]) => {
        finalAbilityScores[ability as keyof AbilityScores] += value;
      });
    }

    const intModifier = Math.floor((finalAbilityScores.intelligence - 10) / 2);
    const languages = selectedRace ? [...races[selectedRace].automaticLanguages] : ['Common'];

    if (intModifier > 0 && selectedRace) {
      const bonusLanguages = races[selectedRace].bonusLanguages.slice(0, intModifier);
      languages.push(...bonusLanguages);
    }

    const specialAbilities: string[] = [];
    if (selectedRace && races[selectedRace]) {
      specialAbilities.push(...races[selectedRace].specialAbilities);
    }
    if (selectedTemplate && templates[selectedTemplate]) {
      specialAbilities.push(...templates[selectedTemplate].specialAbilities);
    }
    if (selectedClass && classes[selectedClass]) {
      specialAbilities.push(...classes[selectedClass].specialAbilities);
    }

    return {
      basicInfo: {
        name: characterName || 'Unnamed Character',
        player: playerName || 'Unknown Player',
        race: selectedRace || 'human',
        template: selectedTemplate || undefined,
        class: selectedClass || 'fighter',
        level: 1,
        alignment: 'true-neutral',
        size: selectedRace && races[selectedRace] ? races[selectedRace].size : 'medium',
      },
      abilityScores: finalAbilityScores,
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
      specialAbilities,
      languages,
    };
  };

  const handleSave = async () => {
    const character = buildCharacter();
    await exportCharacterToJSON(character);
  };

  const handleLoad = () => {
    setShowCharacterList(true);
  };

  const handleNewCharacter = () => {
    if (characterName || playerName || selectedRace || selectedTemplate || selectedClass || skills.length > 0 || feats.length > 0) {
      if (!confirm('Are you sure you want to clear all current character data and start a new character?')) {
        return;
      }
    }

    setCharacterName('');
    setPlayerName('');
    setSelectedRace('');
    setSelectedTemplate('');
    setSelectedClass('');
    setAbilityScores(initialAbilityScores);
    setSkills([]);
    setFeats([]);
    setEquipment(initialEquipment);
  };

  const handleLoadCharacter = (character: Character) => {
    setCharacterName(character.basicInfo.name);
    setPlayerName(character.basicInfo.player);
    setSelectedRace(character.basicInfo.race);
    setSelectedTemplate(character.basicInfo.template || '');
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
            onClick={handleNewCharacter}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Character
          </button>

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

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import from File
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        <Accordion>
          <AccordionItem title="Basic Information" defaultOpen={true}>
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
          </AccordionItem>

          <AccordionItem title="Race">
            <RaceSelector selectedRace={selectedRace} onChange={setSelectedRace} />
          </AccordionItem>

          <AccordionItem title="Template (Optional)">
            <TemplateSelector selectedTemplate={selectedTemplate} onChange={setSelectedTemplate} />
          </AccordionItem>

          <AccordionItem title="Class">
            <ClassSelector selectedClass={selectedClass} onChange={setSelectedClass} />
          </AccordionItem>

          <AccordionItem title="Ability Scores">
            <AbilityScoresComponent scores={abilityScores} onChange={setAbilityScores} />
          </AccordionItem>

          <AccordionItem title="Skills">
            <SkillsSelector
              selectedSkills={skills}
              abilityScores={abilityScores}
              characterClass={selectedClass}
              availablePoints={getSkillPoints()}
              onChange={setSkills}
            />
          </AccordionItem>

          <AccordionItem title="Feats">
            <FeatsSelector
              selectedFeats={feats}
              availableFeats={getAvailableFeats()}
              onChange={setFeats}
            />
          </AccordionItem>

          <AccordionItem title="Equipment">
            <EquipmentSelector equipment={equipment} onChange={setEquipment} />
          </AccordionItem>
        </Accordion>

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
              <span className="ml-2 font-medium">{selectedRace && races[selectedRace] ? races[selectedRace].name : 'Not selected'}</span>
            </div>
            <div>
              <span className="text-gray-400">Template:</span>
              <span className="ml-2 font-medium">{selectedTemplate && templates[selectedTemplate] ? templates[selectedTemplate].name : 'None'}</span>
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

      {showCharacterList && (
        <CharacterList
          onLoadCharacter={handleLoadCharacter}
          onClose={() => setShowCharacterList(false)}
        />
      )}
    </div>
  );
}
