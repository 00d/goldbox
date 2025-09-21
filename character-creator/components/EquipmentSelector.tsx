'use client';

import { useState } from 'react';
import { Equipment, Weapon, Armor, Shield, Item } from '@/types/character';
import { weapons, armors, shields, commonGear } from '@/data/equipment';

interface EquipmentSelectorProps {
  equipment: Equipment;
  onChange: (equipment: Equipment) => void;
}

export default function EquipmentSelector({ equipment, onChange }: EquipmentSelectorProps) {
  const [activeTab, setActiveTab] = useState<'weapons' | 'armor' | 'gear'>('weapons');

  const addWeapon = (weapon: Weapon) => {
    onChange({
      ...equipment,
      weapons: [...equipment.weapons, { ...weapon, equipped: true }],
    });
  };

  const removeWeapon = (index: number) => {
    onChange({
      ...equipment,
      weapons: equipment.weapons.filter((_, i) => i !== index),
    });
  };

  const setArmor = (armor: Armor | undefined) => {
    onChange({ ...equipment, armor });
  };

  const setShield = (shield: Shield | undefined) => {
    onChange({ ...equipment, shield });
  };

  const addGear = (item: Item) => {
    const existingIndex = equipment.gear.findIndex((g) => g.name === item.name);
    if (existingIndex >= 0) {
      const newGear = [...equipment.gear];
      newGear[existingIndex] = {
        ...newGear[existingIndex],
        quantity: newGear[existingIndex].quantity + item.quantity,
      };
      onChange({ ...equipment, gear: newGear });
    } else {
      onChange({ ...equipment, gear: [...equipment.gear, item] });
    }
  };

  const removeGear = (index: number) => {
    onChange({
      ...equipment,
      gear: equipment.gear.filter((_, i) => i !== index),
    });
  };

  const tabs = [
    { id: 'weapons' as const, label: 'Weapons' },
    { id: 'armor' as const, label: 'Armor & Shields' },
    { id: 'gear' as const, label: 'Gear' },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                : 'text-gray-400 hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'weapons' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3 text-[var(--accent)]">Selected Weapons</h3>
            {equipment.weapons.length > 0 ? (
              <div className="space-y-2">
                {equipment.weapons.map((weapon, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--border)]"
                  >
                    <div>
                      <div className="font-medium">{weapon.name}</div>
                      <div className="text-sm text-gray-400">
                        Damage: {weapon.damage} | Crit: {weapon.critical}
                        {weapon.range && ` | Range: ${weapon.range} ft`}
                      </div>
                    </div>
                    <button
                      onClick={() => removeWeapon(index)}
                      className="text-red-400 hover:text-red-300 px-3 py-1 rounded hover:bg-red-900/20"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No weapons selected</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-[var(--accent)]">Available Weapons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {weapons.map((weapon, index) => (
                <button
                  key={index}
                  onClick={() => addWeapon(weapon)}
                  className="p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors text-left"
                >
                  <div className="font-medium">{weapon.name}</div>
                  <div className="text-sm text-gray-400">
                    {weapon.damage} | {weapon.critical}
                    {weapon.range && ` | ${weapon.range} ft`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'armor' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-[var(--accent)]">Armor</h3>
            {equipment.armor ? (
              <div className="p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--primary)] mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{equipment.armor.name}</div>
                    <div className="text-sm text-gray-400">
                      AC: +{equipment.armor.acBonus} | Max Dex: {equipment.armor.maxDex ?? '∞'} |
                      Check Penalty: {equipment.armor.checkPenalty} |
                      Spell Failure: {equipment.armor.arcaneFailure}%
                    </div>
                  </div>
                  <button
                    onClick={() => setArmor(undefined)}
                    className="text-red-400 hover:text-red-300 px-3 py-1 rounded hover:bg-red-900/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm mb-3">No armor selected</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {armors.map((armor, index) => (
                <button
                  key={index}
                  onClick={() => setArmor(armor)}
                  className="p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors text-left"
                >
                  <div className="font-medium">{armor.name}</div>
                  <div className="text-xs text-gray-400">
                    {armor.type.charAt(0).toUpperCase() + armor.type.slice(1)} |
                    AC +{armor.acBonus} | Penalty {armor.checkPenalty}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-[var(--accent)]">Shield</h3>
            {equipment.shield ? (
              <div className="p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--primary)] mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{equipment.shield.name}</div>
                    <div className="text-sm text-gray-400">
                      AC: +{equipment.shield.acBonus} |
                      Check Penalty: {equipment.shield.checkPenalty} |
                      Spell Failure: {equipment.shield.arcaneFailure}%
                    </div>
                  </div>
                  <button
                    onClick={() => setShield(undefined)}
                    className="text-red-400 hover:text-red-300 px-3 py-1 rounded hover:bg-red-900/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm mb-3">No shield selected</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {shields.map((shield, index) => (
                <button
                  key={index}
                  onClick={() => setShield(shield)}
                  className="p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors text-left"
                >
                  <div className="font-medium">{shield.name}</div>
                  <div className="text-xs text-gray-400">
                    AC +{shield.acBonus} | Penalty {shield.checkPenalty}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gear' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3 text-[var(--accent)]">Selected Gear</h3>
            {equipment.gear.length > 0 ? (
              <div className="space-y-2">
                {equipment.gear.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--border)]"
                  >
                    <div>
                      <div className="font-medium">
                        {item.name} {item.quantity > 1 && `(×${item.quantity})`}
                      </div>
                      {item.weight && (
                        <div className="text-sm text-gray-400">
                          Weight: {item.weight * item.quantity} lb
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeGear(index)}
                      className="text-red-400 hover:text-red-300 px-3 py-1 rounded hover:bg-red-900/20"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No gear selected</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-[var(--accent)]">Common Gear</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonGear.map((item, index) => (
                <button
                  key={index}
                  onClick={() => addGear(item)}
                  className="p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors text-left"
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-400">
                    Weight: {item.weight} lb
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}