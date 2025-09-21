import { Feat } from '@/types/character';

export const commonFeats: Feat[] = [
  {
    name: 'Acrobatic',
    description: '+2 bonus on Jump and Tumble checks',
    type: 'general',
  },
  {
    name: 'Agile',
    description: '+2 bonus on Balance and Escape Artist checks',
    type: 'general',
  },
  {
    name: 'Alertness',
    description: '+2 bonus on Listen and Spot checks',
    type: 'general',
  },
  {
    name: 'Animal Affinity',
    description: '+2 bonus on Handle Animal and Ride checks',
    type: 'general',
  },
  {
    name: 'Armor Proficiency (Light)',
    description: 'No armor check penalty on attack rolls when wearing light armor',
    type: 'general',
  },
  {
    name: 'Armor Proficiency (Medium)',
    description: 'No armor check penalty on attack rolls when wearing medium armor',
    prerequisites: ['Armor Proficiency (Light)'],
    type: 'general',
  },
  {
    name: 'Armor Proficiency (Heavy)',
    description: 'No armor check penalty on attack rolls when wearing heavy armor',
    prerequisites: ['Armor Proficiency (Medium)'],
    type: 'general',
  },
  {
    name: 'Athletic',
    description: '+2 bonus on Climb and Swim checks',
    type: 'general',
  },
  {
    name: 'Blind-Fight',
    description: 'Reroll miss chance for concealment',
    type: 'general',
  },
  {
    name: 'Combat Casting',
    description: '+4 bonus on Concentration checks to cast defensively',
    type: 'general',
  },
  {
    name: 'Combat Reflexes',
    description: 'Make additional attacks of opportunity based on Dex modifier',
    type: 'general',
  },
  {
    name: 'Deceitful',
    description: '+2 bonus on Disguise and Forgery checks',
    type: 'general',
  },
  {
    name: 'Deft Hands',
    description: '+2 bonus on Sleight of Hand and Use Rope checks',
    type: 'general',
  },
  {
    name: 'Dodge',
    description: '+1 dodge bonus to AC against one opponent',
    prerequisites: ['Dex 13'],
    type: 'general',
  },
  {
    name: 'Endurance',
    description: '+4 bonus on checks to avoid fatigue, nonlethal damage, etc.',
    type: 'general',
  },
  {
    name: 'Great Fortitude',
    description: '+2 bonus on Fortitude saves',
    type: 'general',
  },
  {
    name: 'Improved Initiative',
    description: '+4 bonus on initiative checks',
    type: 'general',
  },
  {
    name: 'Improved Unarmed Strike',
    description: 'Unarmed attacks are lethal and do not provoke attacks of opportunity',
    type: 'general',
  },
  {
    name: 'Iron Will',
    description: '+2 bonus on Will saves',
    type: 'general',
  },
  {
    name: 'Lightning Reflexes',
    description: '+2 bonus on Reflex saves',
    type: 'general',
  },
  {
    name: 'Martial Weapon Proficiency',
    description: 'No penalty on attack rolls with one martial weapon',
    type: 'general',
  },
  {
    name: 'Mobility',
    description: '+4 dodge bonus to AC against attacks of opportunity from movement',
    prerequisites: ['Dex 13', 'Dodge'],
    type: 'general',
  },
  {
    name: 'Point Blank Shot',
    description: '+1 bonus on attack and damage rolls with ranged weapons within 30 feet',
    type: 'general',
  },
  {
    name: 'Power Attack',
    description: 'Trade attack bonus for damage',
    prerequisites: ['Str 13'],
    type: 'general',
  },
  {
    name: 'Precise Shot',
    description: 'No -4 penalty for shooting into melee',
    prerequisites: ['Point Blank Shot'],
    type: 'general',
  },
  {
    name: 'Quick Draw',
    description: 'Draw weapon as free action',
    prerequisites: ['BAB +1'],
    type: 'general',
  },
  {
    name: 'Rapid Shot',
    description: 'Make one extra ranged attack at -2 penalty to all attacks',
    prerequisites: ['Dex 13', 'Point Blank Shot'],
    type: 'general',
  },
  {
    name: 'Run',
    description: 'Run at 5× speed, +4 on running jumps',
    type: 'general',
  },
  {
    name: 'Shield Proficiency',
    description: 'No armor check penalty on attack rolls when using a shield',
    type: 'general',
  },
  {
    name: 'Simple Weapon Proficiency',
    description: 'No penalty on attack rolls with simple weapons',
    type: 'general',
  },
  {
    name: 'Skill Focus',
    description: '+3 bonus on checks with one skill',
    type: 'general',
  },
  {
    name: 'Spell Focus',
    description: '+1 to DC for one school of magic',
    type: 'general',
  },
  {
    name: 'Stealthy',
    description: '+2 bonus on Hide and Move Silently checks',
    type: 'general',
  },
  {
    name: 'Toughness',
    description: '+3 hit points',
    type: 'general',
  },
  {
    name: 'Track',
    description: 'Use Survival to track creatures',
    type: 'general',
  },
  {
    name: 'Two-Weapon Fighting',
    description: 'Reduce penalties for fighting with two weapons',
    prerequisites: ['Dex 15'],
    type: 'general',
  },
  {
    name: 'Weapon Finesse',
    description: 'Use Dex instead of Str for attack rolls with light weapons',
    prerequisites: ['BAB +1'],
    type: 'general',
  },
  {
    name: 'Weapon Focus',
    description: '+1 bonus on attack rolls with one weapon',
    prerequisites: ['BAB +1'],
    type: 'general',
  },
];