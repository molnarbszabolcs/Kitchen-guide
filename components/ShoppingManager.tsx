import React, { useState } from 'react';
import { ShoppingItem } from '../types';
import { formatQuantity } from '../utils/helpers';
import { supabase } from '../utils/supabase';

interface ShoppingManagerProps {
  items: ShoppingItem[];
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
}

const UNIT_OPTIONS = ['db', 'g', 'dkg', 'kg', 'cs', 'ek', 'tk', 'mk', 'l', 'dl', 'ml'];

const mapShoppingRow = (row: any): ShoppingItem => ({
  id: row.id,
  name: row.name,
  quantity: Number(row.quantity ?? 0),
  unit: row.unit ?? '',
  completed: !!row.completed,
  fromRecipeId: row.from_recipe_id ?? undefined,
});

const ShoppingManager: React.FC<ShoppingManagerProps> = ({ items, setItems }) => {
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState<number | string>(1);
  const [manualUnit, setManualUnit] = useState('db');

  const toggleComplete = async (id: string) => {
    const target = items.find(i => i.id === id);
    if (!target) return;

    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .update({ completed: !target.completed })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setItems(items.map(item => (item.id === id ? mapShoppingRow(data) : item)));
    } catch (err) {
      console.error('Failed to toggle item', err);
      alert('Nem sikerült módosítani az elemet.');
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase.from('shopping_items').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete item', err);
      alert('Nem sikerült törölni az elemet.');
    }
  };

  const clearCompleted = async () => {
    if (!window.confirm('Biztosan törlöd a teljesített tételeket?')) return;
    try {
      const { error } = await supabase.from('shopping_items').delete().eq('completed', true);
      if (error) throw error;
      setItems(items.filter(item => !item.completed));
    } catch (err) {
      console.error('Failed to clear completed items', err);
      alert('Nem sikerült törölni a teljesített tételeket.');
    }
  };
  
  const clearAll = async () => {
    if (!window.confirm('Biztosan kiüríted a teljes listát?')) return;
    if (items.length === 0) return;

    const ids = items.map((item) => item.id);
    try {
      const { error } = await supabase.from('shopping_items').delete().in('id', ids);
      if (error) throw error;
      setItems([]);
    } catch (err) {
      console.error('Failed to clear list', err);
      alert('Nem sikerült kiüríteni a listát.');
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const newItem: ShoppingItem = {
      name: manualName,
      quantity: Number(manualQty) || 1,
      unit: manualUnit,
      completed: false
    };

    // Simple merge logic for manual add
    const existingIndex = items.findIndex(
      i => i.name.toLowerCase() === newItem.name.toLowerCase() && 
           i.unit.toLowerCase() === newItem.unit.toLowerCase() &&
           !i.completed
    );

    if (existingIndex > -1) {
      const target = items[existingIndex];
      const newQuantity = target.quantity + newItem.quantity;
      try {
        const { data, error } = await supabase
          .from('shopping_items')
          .update({ quantity: newQuantity })
          .eq('id', target.id)
          .select()
          .single();
        if (error) throw error;
        const updated = [...items];
        updated[existingIndex] = mapShoppingRow(data);
        setItems(updated);
      } catch (err) {
        console.error('Failed to update quantity', err);
        alert('Nem sikerült frissíteni a mennyiséget.');
      }
    } else {
      try {
        const { data, error } = await supabase
          .from('shopping_items')
          .insert([{
            name: newItem.name,
            quantity: newItem.quantity,
            unit: newItem.unit,
            completed: false,
          }])
          .select()
          .single();
        if (error) throw error;
        setItems([mapShoppingRow(data), ...items]);
      } catch (err) {
        console.error('Failed to add item', err);
        alert('Nem sikerült hozzáadni az elemet.');
      }
    }

    setManualName('');
    setManualQty(1);
    setManualUnit('db');
  };

  // Sort: Incomplete first, then by name
  const sortedItems = [...items].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div className="space-y-6">
      {/* Manual Add Input */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleManualAdd} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700">Gyors hozzáadás</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="Tétel neve..."
                className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-pink-500 focus:ring-0"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={manualQty}
                onChange={e => setManualQty(e.target.value)}
                placeholder="Menny."
                className="w-20 px-3 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-pink-500 focus:ring-0 text-center"
              />
               <select
                value={manualUnit}
                onChange={e => setManualUnit(e.target.value)}
                className="w-24 px-3 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-pink-500 focus:ring-0 text-center"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <button 
                type="submit" 
                className="flex-1 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
              >
                Hozzáad
              </button>
            </div>
        </form>
      </div>

      {/* List */}
      <div>
        <div className="flex justify-between items-end mb-3 px-1">
          <h2 className="text-lg font-bold text-gray-800">Bevásárlólista <span className="text-gray-400 font-normal text-sm">({items.filter(i => !i.completed).length})</span></h2>
          <div className="flex gap-2">
             {items.some(i => i.completed) && (
                <button onClick={clearCompleted} className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-full transition-colors">
                  Kész tételek törlése
                </button>
             )}
             {items.length > 0 && (
                <button onClick={clearAll} className="text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-200 px-3 py-1.5 rounded-full transition-colors">
                  Lista törlése
                </button>
             )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fa-solid fa-basket-shopping text-5xl mb-4 text-gray-200"></i>
            <p>Üres a bevásárlólista.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {sortedItems.map(item => (
              <div 
                key={item.id} 
                className={`flex items-center p-4 transition-all duration-300 ${item.completed ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
              >
                <button 
                  onClick={() => toggleComplete(item.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-300 ${
                    item.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 hover:border-pink-500'
                  }`}
                >
                  {item.completed && <i className="fa-solid fa-check text-white text-xs"></i>}
                </button>

                <div className="flex-1 cursor-pointer" onClick={() => toggleComplete(item.id)}>
                  <p className={`font-medium text-gray-800 transition-all ${item.completed ? 'line-through text-gray-400' : ''}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatQuantity(item.quantity)} {item.unit}
                  </p>
                </div>

                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-gray-300 hover:text-red-400 w-8 h-8 flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingManager;
