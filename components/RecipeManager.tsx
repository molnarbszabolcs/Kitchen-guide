import React, { useState } from 'react';
import { Recipe, Ingredient, ShoppingItem } from '../types';
import { generateId } from '../utils/helpers';
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

    const scaleFactor = desiredServings / servingsModalRecipe.servings;
    
    const newItems: ShoppingItem[] = servingsModalRecipe.ingredients.map(ing => ({
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
      {recipes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4 text-gray-200">
            <i className="fa-solid fa-book-open-reader"></i>
          </div>
          <p className="text-lg font-medium">No recipes yet.</p>
          <p className="text-sm">Tap the + button to create your first masterpiece.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{recipe.name}</h3>
                  {recipe.externalLink && (
                    <a 
                      href={recipe.externalLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-600 ml-2"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-medium uppercase tracking-wide">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-semibold">{recipe.course}</span>
                  <span><i className="fa-solid fa-users mr-1"></i> {recipe.servings} Servings</span>
                  <span><i className="fa-solid fa-carrot mr-1"></i> {recipe.ingredients.length} Ingredients</span>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4 bg-gray-50 p-3 rounded-lg italic border border-gray-100">
                  {recipe.instructions || "No instructions provided."}
                </p>

                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => handleAddToListClick(recipe)}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-cart-plus"></i> Shop
                  </button>
                  <button 
                    onClick={() => handleEditClick(recipe)}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button 
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 lg:absolute lg:bottom-6 lg:right-6">
        <button
          onClick={handleAddNewClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center text-2xl transition-transform hover:scale-105 active:scale-95"
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
