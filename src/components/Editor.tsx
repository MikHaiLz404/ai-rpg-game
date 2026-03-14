'use client';

import React, { useState } from 'react';
import { useEditorStore, EditorTab } from '../store/editorStore';
import { Item, God, Enemy, NPC } from '../types';

const tabLabels: Record<EditorTab, string> = {
  items: 'ไอเทม',
  gods: 'เทพ',
  enemies: 'ศัตรู',
  npcs: 'NPC'
};

const itemTypes = ['weapon', 'armor', 'consumable'];
const emojis = ['⚔️', '🛡️', '🗡️', '🏹', '🔮', '💎', '💰', '🏆', '👑', '⚡', '🔥', '🌊', '🌙', '⭐', '💕', '🦁', '🐉', '🐍', '🦅', '🐺', '🦊', '🐻', '🦄', '👻', '👺', '👹', '💀', '🦴', '🎭'];

const emptyItem: Partial<Item> = { id: '', name: '', nameTH: '', description: '', price: 0, type: 'weapon', effect: { attack: 0 } };
const emptyGod: Partial<God> = { id: '', name: '', nameTH: '', description: '', hp: 100, maxHp: 100, attack: 10, defense: 5, ability: '', abilityTH: '', image: '⚡' };
const emptyEnemy: Partial<Enemy> = { id: '', name: '', nameTH: '', hp: 50, maxHp: 50, attack: 10, defense: 0, image: '👹' };
const emptyNpc: Partial<NPC> = { id: '', name: '', nameTH: '', description: '', image: '👤', dialogue: [] };

export default function Editor() {
  const store = useEditorStore();
  const [itemForm, setItemForm] = useState<Partial<Item>>(emptyItem);
  const [godForm, setGodForm] = useState<Partial<God>>(emptyGod);
  const [enemyForm, setEnemyForm] = useState<Partial<Enemy>>(emptyEnemy);
  const [npcForm, setNpcForm] = useState<Partial<NPC>>(emptyNpc);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  React.useEffect(() => {
    if (!store.isModalOpen) {
      setItemForm(emptyItem); setGodForm(emptyGod); setEnemyForm(emptyEnemy); setNpcForm(emptyNpc);
    }
  }, [store.isModalOpen]);

  React.useEffect(() => {
    if (store.isModalOpen && store.modalMode === 'edit') {
      if (store.activeTab === 'items' && store.selectedItem) setItemForm(store.selectedItem);
      else if (store.activeTab === 'gods' && store.selectedGod) setGodForm(store.selectedGod);
      else if (store.activeTab === 'enemies' && store.selectedEnemy) setEnemyForm(store.selectedEnemy);
      else if (store.activeTab === 'npcs' && store.selectedNpc) setNpcForm(store.selectedNpc);
    }
  }, [store.isModalOpen, store.modalMode, store.activeTab, store.selectedItem, store.selectedGod, store.selectedEnemy, store.selectedNpc]);

  const handleSubmit = () => {
    const { activeTab, modalMode, createItem, updateItem, createGod, updateGod, createEnemy, updateEnemy, createNpc, updateNpc } = store;
    if (modalMode === 'create') {
      if (activeTab === 'items') createItem(itemForm as Item);
      else if (activeTab === 'gods') createGod(godForm as God);
      else if (activeTab === 'enemies') createEnemy(enemyForm as Enemy);
      else if (activeTab === 'npcs') createNpc(npcForm as NPC);
    } else {
      if (activeTab === 'items') updateItem(itemForm as Item);
      else if (activeTab === 'gods') updateGod(godForm as God);
      else if (activeTab === 'enemies') updateEnemy(enemyForm as Enemy);
      else if (activeTab === 'npcs') updateNpc(npcForm as NPC);
    }
  };

  const handleExport = () => {
    const data = store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'gods-arena-data.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => { if (store.importData(importText)) { setImportText(''); setShowImport(false); } };

  const renderErrors = (field: string) => store.errors.filter(e => e.field === field).map(e => (
    <p key={e.field} className="text-red-500 text-sm mt-1">⚠️ {e.message}</p>
  ));

  const renderForm = () => {
    const { activeTab } = store;
    if (activeTab === 'items') {
      return (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">ID</label><input type="text" value={itemForm.id || ''} onChange={(e) => setItemForm({ ...itemForm, id: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="weapon_1" />{renderErrors('id')}</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">ชื่อ (EN)</label><input type="text" value={itemForm.name || ''} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="Bronze Sword" />{renderErrors('name')}</div>
            <div><label className="block text-sm font-medium mb-1">ชื่อ (TH)</label><input type="text" value={itemForm.nameTH || ''} onChange={(e) => setItemForm({ ...itemForm, nameTH: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="ดาบสำริด" />{renderErrors('nameTH')}</div>
          </div>
          <div><label className="block text-sm font-medium mb-1">คำอธิบาย</label><textarea value={itemForm.description || ''} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" rows={2} placeholder="A basic sword" />{renderErrors('description')}</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">ราคา</label><input type="number" value={itemForm.price || 0} onChange={(e) => setItemForm({ ...itemForm, price: parseInt(e.target.value) || 0 })} className="w-full p-2 border rounded bg-gray-800 text-white" />{renderErrors('price')}</div>
            <div><label className="block text-sm font-medium mb-1">ประเภท</label><select value={itemForm.type || 'weapon'} onChange={(e) => setItemForm({ ...itemForm, type: e.target.value as any })} className="w-full p-2 border rounded bg-gray-800 text-white">{itemTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>{renderErrors('type')}</div>
          </div>
          <div><label className="block text-sm font-medium mb-1">เอฟเฟกต์</label><div className="grid grid-cols-3 gap-2"><div><span className="text-xs text-gray-400">HP</span><input type="number" value={itemForm.effect?.hp || 0} onChange={(e) => setItemForm({ ...itemForm, effect: { ...itemForm.effect, hp: parseInt(e.target.value) || 0 } })} className="w-full p-2 border rounded bg-gray-800 text-white" /></div><div><span className="text-xs text-gray-400">Attack</span><input type="number" value={itemForm.effect?.attack || 0} onChange={(e) => setItemForm({ ...itemForm, effect: { ...itemForm.effect, attack: parseInt(e.target.value) || 0 } })} className="w-full p-2 border rounded bg-gray-800 text-white" /></div><div><span className="text-xs text-gray-400">Defense</span><input type="number" value={itemForm.effect?.defense || 0} onChange={(e) => setItemForm({ ...itemForm, effect: { ...itemForm.effect, defense: parseInt(e.target.value) || 0 } })} className="w-full p-2 border rounded bg-gray-800 text-white" /></div></div>{renderErrors('effect')}</div>
        </div>
      );
    }
    if (activeTab === 'gods') {
      return (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">ID</label><input type="text" value={godForm.id || ''} onChange={(e) => setGodForm({ ...godForm, id: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="zeus" />{renderErrors('id')}</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">ชื่อ (EN)</label><input type="text" value={godForm.name || ''} onChange={(e) => setGodForm({ ...godForm, name: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="Zeus" />{renderErrors('name')}</div>
            <div><label className="block text-sm font-medium mb-1">ชื่อ (TH)</label><input type="text" value={godForm.nameTH || ''} onChange={(e) => setGodForm({ ...godForm, nameTH: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="ซูส" />{renderErrors('nameTH')}</div>
          </div>
          <div><label className="block text-sm font-medium mb-1">คำอธิบาย</label><textarea value={godForm.description || ''} onChange={(e) => setGodForm({ ...godForm, description: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" rows={2} placeholder="King of Gods" />{renderErrors('description')}</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">HP</label><input type="number" value={godForm.hp || 0} onChange={(e) => setGodForm({ ...godForm, hp: parseInt(e.target.value) || 0, maxHp: godForm.maxHp || parseInt(e.target.value) || 0 })} className="w-full p-2 border rounded bg-gray-800 text-white" />{renderErrors('hp')}</div>
            <div><label className="block text-sm font-medium mb-1">Max HP</label><input type="number" value={godForm.maxHp || 0} onChange={(e) => setGodForm({ ...godForm, maxHp: parseInt(e.target.value) || 0 })} className="w-full p-2 border rounded bg-gray-800 text-white" />{renderErrors('maxHp')}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">พลังโจมตี</label><input type="number" value={godForm.attack || 0} onChange={(e) => setGodForm({ ...godForm, attack: parseInt(e.target.value) || 0 })} className="w-full p-2 border rounded bg-gray-800 text-white" />{renderErrors('attack')}</div>
            <div><label className="block text-sm font-medium mb-1">พลังป้องกัน</label><input type="number" value={godForm.defense || 0} onChange={(e) => setGodForm({ ...godForm, defense: parseInt(e.target.value) || 0 })} className="w-full p-2 border rounded bg-gray-800 text-white" />{renderErrors('defense')}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">ความสามารถ (EN)</label><input type="text" value={godForm.ability || ''} onChange={(e) => setGodForm({ ...godForm, ability: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="Thunder Strike" />{renderErrors('ability')}</div>
            <div><label className="block text-sm font-medium mb-1">ความสามารถ (TH)</label><input type="text" value={godForm.abilityTH || ''} onChange={(e) => setGodForm({ ...godForm, abilityTH: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="ประกายสายฟ้า" />{renderErrors('abilityTH')}</div>
          </div>
          <div><label className="block text-sm font-medium mb-1">อีโมจิ</label><div className="flex flex-wrap gap-2">{emojis.map(emoji => <button key={emoji} type="button" onClick={() => setGodForm({ ...godForm, image: emoji })} className={`p-2 text-2xl rounded ${godForm.image === emoji ? 'bg-purple-600' : 'bg-gray-700'}`}>{emoji}</button>)}</div>{renderErrors('image')}</div>
        </div>
      );
    }
    if (activeTab === 'enemies') {
      return (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">ID</label><input type="text" value={enemyForm.id || ''} onChange={(e) => setEnemyForm({ ...enemyForm, id: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="minotaur" />{renderErrors('id')}</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">ชื่อ (EN)</label><input type="text" value={enemyForm.name || ''} onChange={(e) => setEnemyForm({ ...enemyForm, name: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="Minotaur" />{renderErrors('name')}</div>
            <div><label className="block text-sm font-medium mb-1">ชื่อ (TH)</label><input type="text" value={enemyForm.nameTH || ''} onChange={(e) => setEnemyForm({ ...enemyForm, nameTH: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="ไมโนเทาร์" />{renderErrors('nameTH')}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">HP</label><input type="number" value={enemyForm.hp || 0} onChange={(e) => setEnemyForm({ ...enemyForm, hp: parseInt(e.target.value) || 0, maxHp: enemyForm.maxHp || parseInt(e.target.value) || 0 })} className="w-full p-2 border rounded bg-gray-800 text-white" />{renderErrors('hp')}</div>
            <div><label className="block text-sm font-medium mb-1">Max HP</label><input type="number" value={enemyForm.maxHp || 0} onChange={(e) => setEnemyForm({ ...enemyForm, maxHp: parseInt(e.target.value) || 0 })} className="w-full p-2 border rounded bg-gray-800 text-white" />{renderErrors('maxHp')}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">พลังโจมตี</label><input type="number" value={enemyForm.attack || 0} onChange={(e) => setEnemyForm({ ...enemyForm, attack: parseInt(e.target.value) || 0 })} className="w-full p-2 border rounded bg-gray-800 text-white" />{renderErrors('attack')}</div>
            <div><label className="block text-sm font-medium mb-1">พลังป้องกัน</label><input type="number" value={enemyForm.defense || 0} onChange={(e) => setEnemyForm({ ...enemyForm, defense: parseInt(e.target.value) || 0 })} className="w-full p-2 border rounded bg-gray-800 text-white" />{renderErrors('defense')}</div>
          </div>
          <div><label className="block text-sm font-medium mb-1">อีโมจิ</label><div className="flex flex-wrap gap-2">{emojis.map(emoji => <button key={emoji} type="button" onClick={() => setEnemyForm({ ...enemyForm, image: emoji })} className={`p-2 text-2xl rounded ${enemyForm.image === emoji ? 'bg-red-600' : 'bg-gray-700'}`}>{emoji}</button>)}</div>{renderErrors('image')}</div>
        </div>
      );
    }
    if (activeTab === 'npcs') {
      return (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">ID</label><input type="text" value={npcForm.id || ''} onChange={(e) => setNpcForm({ ...npcForm, id: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="hermes" />{renderErrors('id')}</div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">ชื่อ (EN)</label><input type="text" value={npcForm.name || ''} onChange={(e) => setNpcForm({ ...npcForm, name: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="Hermes" />{renderErrors('name')}</div>
            <div><label className="block text-sm font-medium mb-1">ชื่อ (TH)</label><input type="text" value={npcForm.nameTH || ''} onChange={(e) => setNpcForm({ ...npcForm, nameTH: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" placeholder="เฮอร์มีส" />{renderErrors('nameTH')}</div>
          </div>
          <div><label className="block text-sm font-medium mb-1">คำอธิบาย</label><textarea value={npcForm.description || ''} onChange={(e) => setNpcForm({ ...npcForm, description: e.target.value })} className="w-full p-2 border rounded bg-gray-800 text-white" rows={2} placeholder="Messenger of the Gods" />{renderErrors('description')}</div>
          <div><label className="block text-sm font-medium mb-1">อีโมจิ</label><div className="flex flex-wrap gap-2">{emojis.map(emoji => <button key={emoji} type="button" onClick={() => setNpcForm({ ...npcForm, image: emoji })} className={`p-2 text-2xl rounded ${npcForm.image === emoji ? 'bg-green-600' : 'bg-gray-700'}`}>{emoji}</button>)}</div>{renderErrors('image')}</div>
          <div><label className="block text-sm font-medium mb-1">บทสนทนา (JSON)</label><textarea value={JSON.stringify(npcForm.dialogue, null, 2)} onChange={(e) => { try { const parsed = JSON.parse(e.target.value); setNpcForm({ ...npcForm, dialogue: parsed }); } catch {} }} className="w-full p-2 border rounded bg-gray-800 text-white font-mono text-sm" rows={8} placeholder='[{"id": "intro", "text": "Hello!", "textTH": "สวัสดี!", "choices": []}]' />{renderErrors('dialogue')}</div>
        </div>
      );
    }
    return null;
  };

  const renderList = () => {
    const { activeTab, items, gods, enemies, npcs, selectItem, selectGod, selectEnemy, selectNpc, deleteItem, deleteGod, deleteEnemy, deleteNpc, openCreateModal, openEditModal } = store;
    if (activeTab === 'items') {
      return (
        <div className="space-y-2">
          <button onClick={openCreateModal} className="w-full py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium">+ เพิ่มไอเทมใหม่</button>
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <div className="flex items-center gap-3"><span className="text-2xl">💎</span><div><p className="font-medium">{item.name} ({item.nameTH})</p><p className="text-sm text-gray-400">{item.type} - {item.price} gold</p></div></div>
              <div className="flex gap-2">
                <button onClick={() => { selectItem(item); openEditModal(); }} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">แก้ไข</button>
                <button onClick={() => deleteItem(item.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">ลบ</button>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (activeTab === 'gods') {
      return (
        <div className="space-y-2">
          <button onClick={openCreateModal} className="w-full py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium">+ เพิ่มเทพใหม่</button>
          {gods.map(god => (
            <div key={god.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <div className="flex items-center gap-3"><span className="text-2xl">{god.image}</span><div><p className="font-medium">{god.name} ({god.nameTH})</p><p className="text-sm text-gray-400">HP: {god.hp} | ATK: {god.attack} | DEF: {god.defense}</p></div></div>
              <div className="flex gap-2">
                <button onClick={() => { selectGod(god); openEditModal(); }} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">แก้ไข</button>
                <button onClick={() => deleteGod(god.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">ลบ</button>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (activeTab === 'enemies') {
      return (
        <div className="space-y-2">
          <button onClick={openCreateModal} className="w-full py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium">+ เพิ่มศัตรูใหม่</button>
          {enemies.map(enemy => (
            <div key={enemy.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <div className="flex items-center gap-3"><span className="text-2xl">{enemy.image}</span><div><p className="font-medium">{enemy.name} ({enemy.nameTH})</p><p className="text-sm text-gray-400">HP: {enemy.hp} | ATK: {enemy.attack} | DEF: {enemy.defense}</p></div></div>
              <div className="flex gap-2">
                <button onClick={() => { selectEnemy(enemy); openEditModal(); }} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">แก้ไข</button>
                <button onClick={() => deleteEnemy(enemy.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">ลบ</button>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (activeTab === 'npcs') {
      return (
        <div className="space-y-2">
          <button onClick={openCreateModal} className="w-full py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium">+ เพิ่ม NPC ใหม่</button>
          {npcs.map(npc => (
            <div key={npc.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <div className="flex items-center gap-3"><span className="text-2xl">{npc.image}</span><div><p className="font-medium">{npc.name} ({npc.nameTH})</p><p className="text-sm text-gray-400">{npc.description}</p></div></div>
              <div className="flex gap-2">
                <button onClick={() => { selectNpc(npc); openEditModal(); }} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">แก้ไข</button>
                <button onClick={() => deleteNpc(npc.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">ลบ</button>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">🔧 Editor Tools - Gods' Arena</h1>
          <div className="flex gap-2">
            <button onClick={handleExport} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded">📤 Export JSON</button>
            <button onClick={() => setShowImport(!showImport)} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded">📥 Import JSON</button>
            <button onClick={store.resetData} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">🔄 Reset</button>
          </div>
        </div>
        {showImport && (
          <div className="mb-6 p-4 bg-gray-800 rounded">
            <h3 className="font-bold mb-2">Import Data (Paste JSON)</h3>
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} className="w-full p-2 border rounded bg-gray-900 text-white font-mono text-sm" rows={6} placeholder='{"items": [], "gods": [], "enemies": [], "npcs": []}' />
            <div className="flex gap-2 mt-2">
              <button onClick={handleImport} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Import</button>
              <button onClick={() => setShowImport(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">Cancel</button>
            </div>
          </div>
        )}
        <div className="flex gap-2 mb-6">
          {(Object.keys(tabLabels) as EditorTab[]).map(tab => (
            <button key={tab} onClick={() => store.setActiveTab(tab)} className={`px-4 py-2 rounded font-medium ${store.activeTab === tab ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>{tabLabels[tab]}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><h2 className="text-xl font-bold mb-4">📋 รายการ{tabLabels[store.activeTab]}</h2>{renderList()}</div>
          <div><h2 className="text-xl font-bold mb-4">📊 สถิติ</h2><div className="grid grid-cols-2 gap-4"><div className="p-4 bg-gray-800 rounded text-center"><p className="text-3xl font-bold text-blue-400">{store.items.length}</p><p className="text-gray-400">ไอเทม</p></div><div className="p-4 bg-gray-800 rounded text-center"><p className="text-3xl font-bold text-purple-400">{store.gods.length}</p><p className="text-gray-400">เทพ</p></div><div className="p-4 bg-gray-800 rounded text-center"><p className="text-3xl font-bold text-red-400">{store.enemies.length}</p><p className="text-gray-400">ศัตรู</p></div><div className="p-4 bg-gray-800 rounded text-center"><p className="text-3xl font-bold text-green-400">{store.npcs.length}</p><p className="text-gray-400">NPC</p></div></div></div>
        </div>
        {store.isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{store.modalMode === 'create' ? '➕ เพิ่ม' : '✏️ แก้ไข'} {tabLabels[store.activeTab]}</h2>
                <button onClick={store.closeModal} className="text-gray-400 hover:text-white text-2xl">×</button>
              </div>
              {renderForm()}
              <div className="flex gap-2 mt-6">
                <button onClick={handleSubmit} className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded font-medium">{store.modalMode === 'create' ? '✅ สร้าง' : '✅ บันทึก'}</button>
                <button onClick={store.closeModal} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded">ยกเลิก</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
