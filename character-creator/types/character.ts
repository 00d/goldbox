export type AbilityScores = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

export type Race =
  | 'human'
  | 'dwarf'
  | 'elf'
  | 'gnome'
  | 'half-elf'
  | 'half-orc'
  | 'halfling';

export type CharacterClass =
  | 'barbarian'
  | 'bard'
  | 'cleric'
  | 'druid'
  | 'fighter'
  | 'monk'
  | 'paladin'
  | 'ranger'
  | 'rogue'
  | 'sorcerer'
  | 'wizard';

export type Alignment =
  | 'lawful-good'
  | 'neutral-good'
  | 'chaotic-good'
  | 'lawful-neutral'
  | 'true-neutral'
  | 'chaotic-neutral'
  | 'lawful-evil'
  | 'neutral-evil'
  | 'chaotic-evil';

export type Skill = {
  name: string;
  ranks: number;
  abilityModifier: keyof AbilityScores;
  classSkill: boolean;
  miscModifier?: number;
};

export type Feat = {
  name: string;
  description: string;
  prerequisites?: string[];
  type?: 'general' | 'item-creation' | 'metamagic' | 'special';
};

export type Equipment = {
  weapons: Weapon[];
  armor?: Armor;
  shield?: Shield;
  gear: Item[];
  money: {
    platinum: number;
    gold: number;
    silver: number;
    copper: number;
  };
};

export type Weapon = {
  name: string;
  damage: string;
  critical: string;
  range?: number;
  type: string;
  equipped?: boolean;
};

export type Armor = {
  name: string;
  type: 'light' | 'medium' | 'heavy';
  acBonus: number;
  maxDex?: number;
  checkPenalty: number;
  arcaneFailure: number;
};

export type Shield = {
  name: string;
  acBonus: number;
  checkPenalty: number;
  arcaneFailure: number;
};

export type Item = {
  name: string;
  quantity: number;
  weight?: number;
  description?: string;
};

export type Character = {
  basicInfo: {
    name: string;
    player: string;
    race: Race;
    class: CharacterClass;
    level: number;
    alignment: Alignment;
    deity?: string;
    size: 'small' | 'medium';
    age?: number;
    gender?: string;
    height?: string;
    weight?: string;
  };
  abilityScores: AbilityScores;
  skills: Skill[];
  feats: Feat[];
  equipment: Equipment;
  hitPoints: {
    max: number;
    current: number;
  };
  armorClass: {
    total: number;
    flatFooted: number;
    touch: number;
  };
  savingThrows: {
    fortitude: number;
    reflex: number;
    will: number;
  };
  baseAttackBonus: number;
  specialAbilities: string[];
  languages: string[];
};