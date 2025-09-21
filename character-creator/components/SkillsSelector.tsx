'use client';

import { Skill, AbilityScores, CharacterClass } from '@/types/character';
import { skills, SkillData } from '@/data/skills';
import { classes } from '@/data/classes';

interface SkillsSelectorProps {
  selectedSkills: Skill[];
  abilityScores: AbilityScores;
  characterClass: CharacterClass | '';
  availablePoints: number;
  onChange: (skills: Skill[]) => void;
}

const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export default function SkillsSelector({
  selectedSkills,
  abilityScores,
  characterClass,
  availablePoints,
  onChange,
}: SkillsSelectorProps) {
  const classSkills = characterClass ? classes[characterClass].classSkills : [];

  const handleRankChange = (skillData: SkillData, ranks: number) => {
    const existingSkillIndex = selectedSkills.findIndex((s) => s.name === skillData.name);
    const isClassSkill = classSkills.includes(skillData.name);

    if (ranks === 0) {
      if (existingSkillIndex >= 0) {
        const newSkills = selectedSkills.filter((s) => s.name !== skillData.name);
        onChange(newSkills);
      }
    } else {
      const newSkill: Skill = {
        name: skillData.name,
        ranks,
        abilityModifier: skillData.ability,
        classSkill: isClassSkill,
      };

      if (existingSkillIndex >= 0) {
        const newSkills = [...selectedSkills];
        newSkills[existingSkillIndex] = newSkill;
        onChange(newSkills);
      } else {
        onChange([...selectedSkills, newSkill]);
      }
    }
  };

  const getSkillRanks = (skillName: string): number => {
    const skill = selectedSkills.find((s) => s.name === skillName);
    return skill?.ranks || 0;
  };

  const getSkillTotal = (skillData: SkillData): number => {
    const ranks = getSkillRanks(skillData.name);
    const abilityMod = calculateModifier(abilityScores[skillData.ability]);
    const isClassSkill = classSkills.includes(skillData.name);
    const classBonus = isClassSkill && ranks > 0 ? 3 : 0;
    return ranks + abilityMod + classBonus;
  };

  const usedPoints = selectedSkills.reduce((total, skill) => {
    const isClassSkill = classSkills.includes(skill.name);
    return total + (isClassSkill ? skill.ranks : skill.ranks * 2);
  }, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-right">
          <div className="text-sm text-gray-400">Skill Points</div>
          <div className="text-xl font-bold">
            <span className={usedPoints > availablePoints ? 'text-red-400' : 'text-[var(--accent)]'}>
              {availablePoints - usedPoints}
            </span>
            <span className="text-gray-400"> / {availablePoints}</span>
          </div>
        </div>
      </div>

      {!characterClass && (
        <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-200 text-sm">
          Please select a class to see class skills and allocate skill points.
        </div>
      )}

      <div className="mb-4 p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--border)] text-sm">
        <p className="text-gray-300">
          <strong className="text-[var(--primary)]">Class skills</strong> cost 1 point per rank.{' '}
          <strong className="text-[var(--secondary)]">Cross-class skills</strong> cost 2 points per rank.
          Max ranks at 1st level: 4 (class), 2 (cross-class).
        </p>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {skills.map((skillData) => {
          const ranks = getSkillRanks(skillData.name);
          const isClassSkill = classSkills.includes(skillData.name);
          const maxRanks = isClassSkill ? 4 : 2;
          const total = getSkillTotal(skillData);
          const abilityMod = calculateModifier(abilityScores[skillData.ability]);

          return (
            <div
              key={skillData.name}
              className={`p-3 rounded-lg border transition-colors ${
                isClassSkill
                  ? 'bg-[var(--primary)]/5 border-[var(--primary)]/30'
                  : 'bg-[var(--input-bg)] border-[var(--border)]'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{skillData.name}</span>
                    {skillData.trainedOnly && (
                      <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded">
                        Trained Only
                      </span>
                    )}
                    {skillData.armorCheckPenalty && (
                      <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">
                        ACP
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {skillData.ability.toUpperCase().slice(0, 3)} ({abilityMod >= 0 ? '+' : ''}
                    {abilityMod})
                    {isClassSkill && ranks > 0 && ' + 3 (class)'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Ranks</div>
                    <input
                      type="number"
                      min="0"
                      max={maxRanks}
                      value={ranks}
                      onChange={(e) =>
                        handleRankChange(skillData, Math.max(0, Math.min(maxRanks, parseInt(e.target.value) || 0)))
                      }
                      disabled={!characterClass}
                      className="w-16 bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
                    />
                  </div>

                  <div className="text-center min-w-[60px]">
                    <div className="text-xs text-gray-400">Total</div>
                    <div className="text-lg font-bold text-[var(--accent)]">
                      {total >= 0 ? '+' : ''}
                      {total}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}