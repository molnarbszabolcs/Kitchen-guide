import React, { useState } from 'react';
import { Recipe, Ingredient, ShoppingItem } from '../types';
import { formatQuantity, generateId } from '../utils/helpers';
import RecipeForm from './RecipeForm';
import ServingsModal from './ServingsModal';
import { supabase } from '../utils/supabase';

interface RecipeManagerProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  onAddToShoppingList: (items: ShoppingItem[]) => void;
}

const mapRecipeRow = (row: any): Recipe => ({
  id: row.id,
  name: row.name,
  course: row.course || 'főétel',
  servings: row.servings ?? 0,
  ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
  instructions: row.instructions ?? '',
  externalLink: row.external_link ?? undefined,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
});

const RecipeManager: React.FC<RecipeManagerProps> = ({ recipes, setRecipes, onAddToShoppingList }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [servingsModalRecipe, setServingsModalRecipe] = useState<Recipe | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const availableCourses = Array.from(
    new Set(
      recipes
        .map((r) => (r.course || '').trim())
        .filter((c) => c.length > 0)
    )
  );
  const filteredRecipes =
    courseFilter === 'all'
      ? recipes
      : recipes.filter((r) => (r.course || '').trim().toLowerCase() === courseFilter.toLowerCase());

  // -- CRUD Operations --
  const handleSaveRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
    try {
      if (editingRecipe) {
        const { data, error } = await supabase
          .from('recipes')
          .update({
            name: recipeData.name,
            course: recipeData.course,
            servings: recipeData.servings,
            ingredients: recipeData.ingredients,
            instructions: recipeData.instructions,
            external_link: recipeData.externalLink ?? null,
          })
          .eq('id', editingRecipe.id)
          .select()
          .single();

        if (error) throw error;
        const updated = mapRecipeRow(data);
        setRecipes(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      } else {
        const { data, error } = await supabase
          .from('recipes')
          .insert([
            {
              name: recipeData.name,
              course: recipeData.course,
              servings: recipeData.servings,
              ingredients: recipeData.ingredients,
              instructions: recipeData.instructions,
              external_link: recipeData.externalLink ?? null,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        const newRecipe = mapRecipeRow(data);
        setRecipes(prev => [newRecipe, ...prev]);
      }
      setView('list');
      setEditingRecipe(null);
    } catch (err) {
      console.error('Failed to save recipe:', err);
      alert('Nem sikerült menteni a receptet. Ellenőrizd a Supabase kapcsolatot és a táblát.');
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete recipe:', err);
      alert('Nem sikerült törölni a receptet.');
    }
  };

  const handleEditClick = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setView('form');
  };

  const handleAddNewClick = () => {
    setEditingRecipe(null);
    setView('form');
  };

  const handleAddToListClick = (recipe: Recipe) => {
    setServingsModalRecipe(recipe);
  };

  const confirmAddToList = (desiredServings: number) => {
    if (!servingsModalRecipe) return;

    const baseServings = servingsModalRecipe.servings || 1;
    const safeDesired = Math.max(1, desiredServings);
    const scaleFactor = baseServings > 0 ? safeDesired / baseServings : 1;
    const normalizedIngredients = (servingsModalRecipe.ingredients || []).map((ing) => ({
      ...ing,
      name: (ing.name || '').trim(),
      unit: (ing.unit || '').trim(),
      quantity: Number(ing.quantity) || 0,
    }));
    const validIngredients = normalizedIngredients.filter(
      (ing) => ing.name && Number.isFinite(ing.quantity) && ing.quantity > 0
    );
    if (validIngredients.length === 0) {
      alert('A recept nem tartalmaz érvényes hozzávalókat.');
      return;
    }
    
    const newItems: ShoppingItem[] = validIngredients.map(ing => ({
      id: generateId(),
      name: ing.name,
      quantity: ing.quantity * scaleFactor,
      unit: ing.unit,
      completed: false,
      fromRecipeId: servingsModalRecipe.id
    }));

    onAddToShoppingList(newItems);
    setServingsModalRecipe(null);
    // Simple feedback could be added here
  };

  if (view === 'form') {
    return (
      <RecipeForm 
        initialData={editingRecipe} 
        onSave={handleSaveRecipe} 
        onCancel={() => setView('list')} 
      />
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {view === 'list' && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Receptek</h2>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-gray-600">Kategória:</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 text-sm"
            >
              <option value="all">Összes</option>
              {availableCourses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4 text-gray-200">
            <i className="fa-solid fa-book-open-reader"></i>
          </div>
          <p className="text-lg font-medium">Nincs recept a szűrésnek megfelelően.</p>
          <p className="text-sm">Add hozzá az első receptet, vagy töröld a szűrőt.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRecipes.map(recipe => {
            const isExpanded = expandedId === recipe.id;
            return (
              <div key={recipe.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-800 truncate">{recipe.name}</h3>
                      <span className="inline-flex items-center w-fit px-2 py-1 bg-pink-50 text-pink-700 rounded-md text-[11px] font-semibold uppercase tracking-wide">
                        {recipe.course}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {recipe.externalLink && (
                        <a 
                          href={recipe.externalLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        className="text-pink-500 hover:text-pink-600"
                          title="Megnyitás"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                      )}
                      <button
                        onClick={() => toggleExpanded(recipe.id)}
                        className="text-gray-500 hover:text-gray-700 text-sm font-semibold flex items-center gap-1"
                      >
                        {isExpanded ? 'Kevesebb' : 'Részletek'}{' '}
                        <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-xs`}></i>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium uppercase tracking-wide">
                        <span><i className="fa-solid fa-users mr-1"></i> {recipe.servings} adag</span>
                        <span><i className="fa-solid fa-carrot mr-1"></i> {recipe.ingredients.length} hozzávaló</span>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-800">Hozzávalók</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {recipe.ingredients.map((ing) => (
                            <div key={ing.id} className="flex justify-between items-center text-sm text-gray-700 bg-white/60 px-3 py-2 rounded-lg">
                              <span className="truncate">{ing.name}</span>
                              <span className="text-xs text-gray-500">
                                {formatQuantity(ing.quantity)} {ing.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-3">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Elkészítés</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {recipe.instructions || 'Nincs leírás.'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => handleAddToListClick(recipe)}
                      className="flex-1 bg-pink-50 hover:bg-pink-100 text-pink-700 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-cart-plus"></i> Bevásárlólista
                    </button>
                    <button 
                      onClick={() => handleEditClick(recipe)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Szerkesztés"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                      title="Törlés"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 lg:absolute lg:bottom-6 lg:right-6">
        <button
          onClick={handleAddNewClick}
          className="bg-pink-500 hover:bg-pink-600 text-white w-14 h-14 rounded-full shadow-lg shadow-pink-200 flex items-center justify-center text-2xl transition-transform hover:scale-105 active:scale-95"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>

      {servingsModalRecipe && (
        <ServingsModal 
          recipe={servingsModalRecipe} 
          onConfirm={confirmAddToList} 
          onClose={() => setServingsModalRecipe(null)} 
        />
      )}
    </div>
  );
};

export default RecipeManager;
