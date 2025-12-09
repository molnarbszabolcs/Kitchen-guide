import React, { useState, useEffect } from 'react';
import { Tab, Recipe, ShoppingItem } from './types';
import RecipeManager from './components/RecipeManager';
import ShoppingManager from './components/ShoppingManager';
import { supabase } from './utils/supabase';

type RecipeRow = {
  id: string;
  name: string;
  course?: string | null;
  servings: number;
  ingredients: any[];
  instructions?: string;
  external_link?: string | null;
  created_at?: string;
};

type ShoppingRow = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  completed: boolean;
  from_recipe_id?: string | null;
  created_at?: string;
};

const mapRecipe = (row: RecipeRow): Recipe => ({
  id: row.id,
  name: row.name,
  course: row.course || 'főétel',
  servings: row.servings ?? 0,
  ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
  instructions: row.instructions ?? '',
  externalLink: row.external_link ?? undefined,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
});

const mapShoppingItem = (row: ShoppingRow): ShoppingItem => ({
  id: row.id,
  name: row.name,
  quantity: Number(row.quantity ?? 0),
  unit: row.unit ?? '',
  completed: !!row.completed,
  fromRecipeId: row.from_recipe_id ?? undefined,
});

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [recipeRes, shoppingRes] = await Promise.all([
          supabase.from('recipes').select('*').order('created_at', { ascending: false }),
          supabase.from('shopping_items').select('*').order('created_at', { ascending: false }),
        ]);

        if (recipeRes.error) throw recipeRes.error;
        if (shoppingRes.error) throw shoppingRes.error;

        setRecipes((recipeRes.data ?? []).map(mapRecipe));
        setShoppingList((shoppingRes.data ?? []).map(mapShoppingItem));
        setErrorMessage(null);
      } catch (err: any) {
        console.error('Failed to load data from Supabase:', err);
        setErrorMessage('Nem sikerült betölteni az adatokat. Ellenőrizd a kapcsolatot és a táblákat a Supabase-ben.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // -- Handlers --
  const handleAddItemsToShoppingList = async (items: ShoppingItem[]) => {
    try {
      let updatedList = [...shoppingList];
      const itemsToInsert: ShoppingItem[] = [];

      for (const newItem of items) {
        const existingIndex = updatedList.findIndex(
          i =>
            i.name.toLowerCase() === newItem.name.toLowerCase() &&
            i.unit.toLowerCase() === newItem.unit.toLowerCase() &&
            !i.completed
        );

        if (existingIndex > -1) {
          const existing = updatedList[existingIndex];
          const newQuantity = existing.quantity + newItem.quantity;
          const { data, error } = await supabase
            .from('shopping_items')
            .update({ quantity: newQuantity })
            .eq('id', existing.id)
            .select()
            .single();
          if (error) throw error;
          updatedList[existingIndex] = mapShoppingItem(data as ShoppingRow);
        } else {
          itemsToInsert.push(newItem);
        }
      }

      if (itemsToInsert.length > 0) {
        const { data, error } = await supabase
          .from('shopping_items')
          .insert(
            itemsToInsert.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unit: i.unit,
              completed: false,
              from_recipe_id: i.fromRecipeId ?? null,
            }))
          )
          .select();
        if (error) throw error;
        const inserted = (data ?? []).map((row) => mapShoppingItem(row as ShoppingRow));
        updatedList = [...inserted, ...updatedList];
      }

      setShoppingList(updatedList);
      setErrorMessage(null);
    } catch (err) {
      console.error('Failed to sync shopping list items:', err);
      setErrorMessage('Nem sikerült frissíteni a bevásárló listát.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-2xl mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 pt-safe-top">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="bg-indigo-600 text-white p-1.5 rounded-lg text-sm">
              <i className="fa-solid fa-utensils"></i>
            </span>
            ChefMate
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pb-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'recipes'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fa-solid fa-book-open"></i> Recipes
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'shopping'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fa-solid fa-cart-shopping"></i> Shopping
              {shoppingList.filter(i => !i.completed).length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem]">
                  {shoppingList.filter(i => !i.completed).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-10">Betöltés...</div>
        ) : errorMessage ? (
          <div className="text-center text-red-500 py-10 text-sm">{errorMessage}</div>
        ) : activeTab === 'recipes' ? (
          <RecipeManager 
            recipes={recipes} 
            setRecipes={setRecipes} 
            onAddToShoppingList={handleAddItemsToShoppingList}
          />
        ) : (
          <ShoppingManager 
            items={shoppingList} 
            setItems={setShoppingList} 
          />
        )}
      </main>
      
    </div>
  );
};

export default App;
