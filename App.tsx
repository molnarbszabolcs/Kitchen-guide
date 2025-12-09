import React, { useState, useEffect } from 'react';
import { Tab, Recipe, ShoppingItem, Ingredient } from './types';
import { generateId } from './utils/helpers';
import RecipeManager from './components/RecipeManager';
import ShoppingManager from './components/ShoppingManager';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('recipes');
  
  // -- State Initialization with LocalStorage --
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('chefmate_recipes');
    return saved ? JSON.parse(saved) : [];
  });

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('chefmate_shopping');
    return saved ? JSON.parse(saved) : [];
  });

  // -- Persistence Effects --
  useEffect(() => {
    localStorage.setItem('chefmate_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('chefmate_shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // -- Handlers --
  const handleAddItemsToShoppingList = (items: ShoppingItem[]) => {
    setShoppingList(prev => {
      // Optional: Merge items with same name and unit
      const newList = [...prev];
      items.forEach(newItem => {
        const existingIndex = newList.findIndex(
          i => i.name.toLowerCase() === newItem.name.toLowerCase() && 
               i.unit.toLowerCase() === newItem.unit.toLowerCase() &&
               !i.completed // Only merge with active items
        );

        if (existingIndex > -1) {
          newList[existingIndex].quantity += newItem.quantity;
        } else {
          newList.push(newItem);
        }
      });
      return newList;
    });
    // Switch to shopping tab to show user feedback or let them stay?
    // Let's create a brief toast notification logic ideally, but for now we stay on recipes
    // and show a badge or similar. We will just alert nicely or use UI feedback in the component.
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
        {activeTab === 'recipes' ? (
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