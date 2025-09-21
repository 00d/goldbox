import { AbilityScores } from '@/types/character';

export type SkillData = {
  name: string;
  ability: keyof AbilityScores;
  trainedOnly?: boolean;
  armorCheckPenalty?: boolean;
};

export const skills: SkillData[] = [
  { name: 'Appraise', ability: 'intelligence' },
  { name: 'Balance', ability: 'dexterity', armorCheckPenalty: true },
  { name: 'Bluff', ability: 'charisma' },
  { name: 'Climb', ability: 'strength', armorCheckPenalty: true },
  { name: 'Concentration', ability: 'constitution' },
  { name: 'Craft (alchemy)', ability: 'intelligence' },
  { name: 'Craft (armor)', ability: 'intelligence' },
  { name: 'Craft (weapons)', ability: 'intelligence' },
  { name: 'Decipher Script', ability: 'intelligence', trainedOnly: true },
  { name: 'Diplomacy', ability: 'charisma' },
  { name: 'Disable Device', ability: 'intelligence', trainedOnly: true },
  { name: 'Disguise', ability: 'charisma' },
  { name: 'Escape Artist', ability: 'dexterity', armorCheckPenalty: true },
  { name: 'Forgery', ability: 'intelligence' },
  { name: 'Gather Information', ability: 'charisma' },
  { name: 'Handle Animal', ability: 'charisma', trainedOnly: true },
  { name: 'Heal', ability: 'wisdom' },
  { name: 'Hide', ability: 'dexterity', armorCheckPenalty: true },
  { name: 'Intimidate', ability: 'charisma' },
  { name: 'Jump', ability: 'strength', armorCheckPenalty: true },
  { name: 'Knowledge (arcana)', ability: 'intelligence', trainedOnly: true },
  { name: 'Knowledge (architecture)', ability: 'intelligence', trainedOnly: true },
  { name: 'Knowledge (dungeoneering)', ability: 'intelligence', trainedOnly: true },
  { name: 'Knowledge (geography)', ability: 'intelligence', trainedOnly: true },
  { name: 'Knowledge (history)', ability: 'intelligence', trainedOnly: true },
  { name: 'Knowledge (local)', ability: 'intelligence', trainedOnly: true },
  { name: 'Knowledge (nature)', ability: 'intelligence', trainedOnly: true },
  { name: 'Knowledge (nobility)', ability: 'intelligence', trainedOnly: true },
  { name: 'Knowledge (religion)', ability: 'intelligence', trainedOnly: true },
  { name: 'Knowledge (the planes)', ability: 'intelligence', trainedOnly: true },
  { name: 'Listen', ability: 'wisdom' },
  { name: 'Move Silently', ability: 'dexterity', armorCheckPenalty: true },
  { name: 'Open Lock', ability: 'dexterity', trainedOnly: true },
  { name: 'Perform', ability: 'charisma' },
  { name: 'Profession', ability: 'wisdom', trainedOnly: true },
  { name: 'Ride', ability: 'dexterity' },
  { name: 'Search', ability: 'intelligence' },
  { name: 'Sense Motive', ability: 'wisdom' },
  { name: 'Sleight of Hand', ability: 'dexterity', trainedOnly: true, armorCheckPenalty: true },
  { name: 'Speak Language', ability: 'intelligence', trainedOnly: true },
  { name: 'Spellcraft', ability: 'intelligence', trainedOnly: true },
  { name: 'Spot', ability: 'wisdom' },
  { name: 'Survival', ability: 'wisdom' },
  { name: 'Swim', ability: 'strength', armorCheckPenalty: true },
  { name: 'Tumble', ability: 'dexterity', trainedOnly: true, armorCheckPenalty: true },
  { name: 'Use Magic Device', ability: 'charisma', trainedOnly: true },
  { name: 'Use Rope', ability: 'dexterity' },
];