import React, { useState } from 'react';
import { Recipe, Ingredient } from '../types';
import { generateId } from '../utils/helpers';

interface RecipeFormProps {
  initialData: Recipe | null;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const UNIT_OPTIONS = ['db', 'g', 'dkg', 'kg', 'cs', 'ek', 'tk', 'mk', 'l', 'dl', 'ml'];

const RecipeForm: React.FC<RecipeFormProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [course, setCourse] = useState(initialData?.course || 'főétel');
  const [servings, setServings] = useState(initialData?.servings || 2);
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [externalLink, setExternalLink] = useState(initialData?.externalLink || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients || [{ id: generateId(), name: '', quantity: 1, unit: 'db' }]
  );

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { id: generateId(), name: '', quantity: 1, unit: 'db' }]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleIngredientChange = (id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Recipe name is required');
    
    // Filter out empty ingredients
    const validIngredients = ingredients.filter(ing => ing.name.trim() !== '');

    onSave({
      name,
      course,
      servings,
      instructions,
      ingredients: validIngredients,
      externalLink: externalLink || undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {initialData ? 'Recept szerkesztése' : 'Új recept'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Recept neve</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:border-pink-500 focus:bg-white focus:ring-0 transition-all text-gray-900"
              placeholder="pl. Nagyi spagettije"
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Adag</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={e => setServings(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:border-pink-500 focus:bg-white focus:ring-0 transition-all"
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fogás</label>
              <select
                value={course}
                onChange={e => setCourse(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:border-pink-500 focus:bg-white focus:ring-0 transition-all"
              >
                <option value="reggeli">Reggeli</option>
                <option value="főétel">Főétel</option>
                <option value="leves">Leves</option>
                <option value="főzelék">Főzelék</option>
                <option value="tészta">Tészta</option>
                <option value="péksütemény">Péksütemény</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Link (opcionális)</label>
              <input
                type="url"
                value={externalLink}
                onChange={e => setExternalLink(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:border-pink-500 focus:bg-white focus:ring-0 transition-all text-sm"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-gray-700">Hozzávalók</label>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 px-2 py-1 rounded-md"
            >
              + Hozzáadás
            </button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ing) => (
              <div key={ing.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={ing.name}
                  onChange={e => handleIngredientChange(ing.id, 'name', e.target.value)}
                  placeholder="Hozzávaló"
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-pink-500 focus:ring-0 text-sm"
                />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={ing.quantity}
                  onChange={e => handleIngredientChange(ing.id, 'quantity', Number(e.target.value))}
                  placeholder="Menny."
                  className="w-16 px-2 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-pink-500 focus:ring-0 text-sm text-center"
                />
                <select
                  value={ing.unit}
                  onChange={e => handleIngredientChange(ing.id, 'unit', e.target.value)}
                  className="w-20 px-2 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-pink-500 focus:ring-0 text-sm text-center"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                  {!UNIT_OPTIONS.includes(ing.unit) && ing.unit && (
                    <option value={ing.unit}>{ing.unit}</option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(ing.id)}
                  className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Elkészítés</label>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:border-pink-500 focus:bg-white focus:ring-0 transition-all text-sm"
            placeholder="How to prepare..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
          >
            Mégse
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 shadow-md shadow-pink-200 transition-colors"
          >
            Recept mentése
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;
