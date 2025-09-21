export interface TemplateData {
  name: string;
  category: 'inherited' | 'acquired' | 'undead' | 'fiendish' | 'celestial' | 'elemental' | 'lycanthrope' | 'other';
  abilityAdjustments: Partial<{
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }>;
  sizeChange?: 'smaller' | 'same' | 'larger';
  specialAbilities: string[];
  levelAdjustment?: number;
  description: string;
}

export const templates: Record<string, TemplateData> = {
  half_dragon: {
    name: 'Half-Dragon',
    category: 'inherited',
    abilityAdjustments: { strength: 8, constitution: 2, intelligence: 2, charisma: 2 },
    specialAbilities: [
      'Darkvision 60 ft',
      'Low-light vision',
      'Immunity to sleep and paralysis',
      'Breath weapon: 30 ft line or 15 ft cone (based on dragon type)',
      'Natural armor +4',
      'Two claw attacks (1d6) and bite attack (1d8)',
      'Wings provide fly speed equal to base speed (average maneuverability)',
    ],
    levelAdjustment: 3,
    description: 'Half-dragons are born of a dragon and another creature. They combine the best features of both parents.',
  },

  half_celestial: {
    name: 'Half-Celestial',
    category: 'celestial',
    abilityAdjustments: { strength: 4, dexterity: 2, constitution: 4, intelligence: 2, wisdom: 4, charisma: 4 },
    specialAbilities: [
      'Darkvision 60 ft',
      'Immunity to disease',
      'Acid, cold, and electricity resistance 10',
      'Damage reduction 5/magic',
      'Spell resistance: 10 + HD',
      'Spell-like abilities: protection from evil, bless, aid, detect evil, cure serious wounds',
      'Natural armor +1',
      'Wings provide fly speed equal to base speed (good maneuverability)',
    ],
    levelAdjustment: 4,
    description: 'Half-celestials are the offspring of a celestial being and a mortal creature.',
  },

  half_fiend: {
    name: 'Half-Fiend',
    category: 'fiendish',
    abilityAdjustments: { strength: 4, dexterity: 4, constitution: 2, intelligence: 4, charisma: 2 },
    specialAbilities: [
      'Darkvision 60 ft',
      'Immunity to poison',
      'Acid, cold, electricity, and fire resistance 10',
      'Damage reduction 5/magic',
      'Spell resistance: 10 + HD',
      'Spell-like abilities: darkness, desecrate, unholy blight, poison, contagion, blasphemy',
      'Natural armor +1',
      'Bite, 2 claws attacks',
      'Wings provide fly speed equal to base speed (average maneuverability)',
    ],
    levelAdjustment: 4,
    description: 'Half-fiends are the offspring of a fiend and a mortal creature.',
  },

  vampire: {
    name: 'Vampire',
    category: 'undead',
    abilityAdjustments: { strength: 6, dexterity: 4, intelligence: 2, wisdom: 2, charisma: 4 },
    specialAbilities: [
      'Undead type (no Constitution score)',
      'Blood drain',
      'Children of the night',
      'Dominate (gaze attack)',
      'Create spawn',
      'Energy drain (2 negative levels)',
      'Alternate form (bat, dire bat, wolf, or dire wolf)',
      'Damage reduction 10/silver and magic',
      'Fast healing 5',
      'Gaseous form',
      'Spider climb',
      'Turn resistance +4',
      'Weakness: Cannot enter home without invitation, repelled by garlic/mirrors/holy symbols',
      'Vulnerability to sunlight (destroyed if exposed)',
    ],
    levelAdjustment: 8,
    description: 'Vampires are powerful undead creatures that feed on the blood of the living.',
  },

  lich: {
    name: 'Lich',
    category: 'undead',
    abilityAdjustments: { intelligence: 2, wisdom: 2, charisma: 2 },
    specialAbilities: [
      'Undead type (no Constitution score)',
      'Damage reduction 15/bludgeoning and magic',
      'Immunity to cold, electricity, polymorph, mind-affecting',
      'Paralyzing touch',
      'Fear aura (60 ft)',
      'Turn resistance +4',
      'Phylactery: reforms 1d10 days after destruction',
    ],
    levelAdjustment: 4,
    description: 'A lich is an undead spellcaster who has used dark magic to achieve immortality.',
  },

  skeleton: {
    name: 'Skeleton',
    category: 'undead',
    abilityAdjustments: { dexterity: 2 },
    specialAbilities: [
      'Undead type (no Constitution score)',
      'Damage reduction 5/bludgeoning',
      'Immunity to cold',
    ],
    levelAdjustment: 1,
    description: 'Animated bones of the dead, serving as tireless undead warriors.',
  },

  zombie: {
    name: 'Zombie',
    category: 'undead',
    abilityAdjustments: { strength: 2, dexterity: -2 },
    specialAbilities: [
      'Undead type (no Constitution score)',
      'Single actions only',
      'Damage reduction 5/slashing',
      'Toughness feat',
    ],
    levelAdjustment: 1,
    description: 'Reanimated corpses that shamble forth to attack the living.',
  },

  ghost: {
    name: 'Ghost',
    category: 'undead',
    abilityAdjustments: { dexterity: 4, intelligence: 2, wisdom: 4, charisma: 4 },
    specialAbilities: [
      'Undead type (no Constitution score)',
      'Incorporeal',
      'Manifestation',
      'Rejuvenation: reforms in 2d4 days',
      'Telekinesis',
      'Corrupting gaze or corrupting touch',
      'Draining touch',
      'Frightful moan',
      'Horrific appearance',
      'Malevolence',
      'Turn resistance +4',
    ],
    levelAdjustment: 5,
    description: 'The restless spirit of the deceased, bound to the material world.',
  },

  lycanthrope_werewolf: {
    name: 'Werewolf (Afflicted)',
    category: 'lycanthrope',
    abilityAdjustments: { strength: 2, constitution: 4, wisdom: 2 },
    specialAbilities: [
      'Alternate form: wolf and hybrid',
      'Damage reduction 10/silver',
      'Low-light vision',
      'Scent',
      'Trip attack (wolf form)',
      'Curse of lycanthropy',
      'Control shape (Wisdom-based)',
      'Involuntary change during full moon (afflicted)',
    ],
    levelAdjustment: 3,
    description: 'Afflicted with the curse of lycanthropy, able to transform into a wolf.',
  },

  lycanthrope_werebear: {
    name: 'Werebear (Afflicted)',
    category: 'lycanthrope',
    abilityAdjustments: { strength: 16, constitution: 4, wisdom: 2 },
    specialAbilities: [
      'Alternate form: brown bear and hybrid',
      'Damage reduction 10/silver',
      'Low-light vision',
      'Scent',
      'Improved grab',
      'Curse of lycanthropy',
      'Control shape (Wisdom-based)',
      'Involuntary change during full moon (afflicted)',
    ],
    levelAdjustment: 3,
    description: 'Afflicted with the curse of lycanthropy, able to transform into a bear.',
  },

  lycanthrope_wererat: {
    name: 'Wererat (Afflicted)',
    category: 'lycanthrope',
    abilityAdjustments: { dexterity: 6, constitution: 2 },
    specialAbilities: [
      'Alternate form: dire rat and hybrid',
      'Damage reduction 10/silver',
      'Low-light vision',
      'Scent',
      'Disease (filth fever)',
      'Curse of lycanthropy',
      'Control shape (Wisdom-based)',
      'Involuntary change during full moon (afflicted)',
    ],
    levelAdjustment: 3,
    description: 'Afflicted with the curse of lycanthropy, able to transform into a rat.',
  },

  lycanthrope_weretiger: {
    name: 'Weretiger (Afflicted)',
    category: 'lycanthrope',
    abilityAdjustments: { strength: 12, dexterity: 4, constitution: 6 },
    specialAbilities: [
      'Alternate form: tiger and hybrid',
      'Damage reduction 10/silver',
      'Low-light vision',
      'Scent',
      'Improved grab',
      'Pounce',
      'Rake (2 rear claws)',
      'Curse of lycanthropy',
      'Control shape (Wisdom-based)',
      'Involuntary change during full moon (afflicted)',
    ],
    levelAdjustment: 3,
    description: 'Afflicted with the curse of lycanthropy, able to transform into a tiger.',
  },

  celestial_creature: {
    name: 'Celestial Creature',
    category: 'celestial',
    abilityAdjustments: { charisma: 4 },
    specialAbilities: [
      'Darkvision 60 ft',
      'Resistance to acid 5, cold 5, electricity 5',
      'Damage reduction 5/magic (CR 4+)',
      'Spell resistance: 5 + HD (CR 4+)',
      'Smite evil 1/day',
    ],
    levelAdjustment: 1,
    description: 'Creatures touched by the power of the upper planes.',
  },

  fiendish_creature: {
    name: 'Fiendish Creature',
    category: 'fiendish',
    abilityAdjustments: { charisma: 4 },
    specialAbilities: [
      'Darkvision 60 ft',
      'Resistance to cold 5, fire 5',
      'Damage reduction 5/magic (CR 4+)',
      'Spell resistance: 5 + HD (CR 4+)',
      'Smite good 1/day',
    ],
    levelAdjustment: 1,
    description: 'Creatures corrupted by the power of the lower planes.',
  },

  pseudonatural: {
    name: 'Pseudonatural',
    category: 'other',
    abilityAdjustments: { strength: 4, constitution: 4 },
    specialAbilities: [
      'Darkvision 60 ft',
      'Acid and electricity resistance 5',
      'Damage reduction 5/magic',
      'Spell resistance: 10 + HD',
      'True strike 3/day',
      'Alternate form: grotesque version of true form',
      'Unnatural aura: animals do not willingly approach',
    ],
    levelAdjustment: 2,
    description: 'Creatures touched by the Far Realm, warped into something alien and wrong.',
  },

  feral: {
    name: 'Feral',
    category: 'acquired',
    abilityAdjustments: { strength: 4, dexterity: 4, constitution: 4, intelligence: -6 },
    specialAbilities: [
      'Low-light vision',
      'Scent',
      '+4 on Survival checks when tracking by scent',
      'Feral fury: +2 bonus on attacks when below half hit points',
      'Cannot speak, understand, or use items requiring intelligence',
    ],
    levelAdjustment: 0,
    description: 'A creature that has reverted to a bestial, savage state.',
  },
};