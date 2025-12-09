import React, { useState } from 'react';
import { Recipe, Ingredient } from '../types';
import { generateId } from '../utils/helpers';

interface RecipeFormProps {
  initialData: Recipe | null;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [servings, setServings] = useState(initialData?.servings || 2);
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [externalLink, setExternalLink] = useState(initialData?.externalLink || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients || [{ id: generateId(), name: '', quantity: 1, unit: 'pc' }]
  );

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { id: generateId(), name: '', quantity: 1, unit: 'pc' }]);
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
          {initialData ? 'Edit Recipe' : 'New Recipe'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Recipe Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-0 transition-all text-gray-900"
              placeholder="e.g. Mom's Spaghetti"
              required
            />
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Servings</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={e => setServings(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-0 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Link (Optional)</label>
              <input
                type="url"
                value={externalLink}
                onChange={e => setExternalLink(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-0 transition-all text-sm"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-gray-700">Ingredients</label>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ing) => (
              <div key={ing.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={ing.name}
                  onChange={e => handleIngredientChange(ing.id, 'name', e.target.value)}
                  placeholder="Ingredient"
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 text-sm"
                />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={ing.quantity}
                  onChange={e => handleIngredientChange(ing.id, 'quantity', Number(e.target.value))}
                  placeholder="Qty"
                  className="w-16 px-2 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 text-sm text-center"
                />
                <input
                  type="text"
                  value={ing.unit}
                  onChange={e => handleIngredientChange(ing.id, 'unit', e.target.value)}
                  placeholder="Unit"
                  className="w-16 px-2 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 text-sm text-center"
                />
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
          <label className="block text-sm font-semibold text-gray-700 mb-1">Method</label>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-0 transition-all text-sm"
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
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
          >
            Save Recipe
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;