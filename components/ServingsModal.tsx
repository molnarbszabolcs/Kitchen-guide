import React, { useState } from 'react';
import { Recipe } from '../types';

interface ServingsModalProps {
  recipe: Recipe;
  onConfirm: (servings: number) => void;
  onClose: () => void;
}

const ServingsModal: React.FC<ServingsModalProps> = ({ recipe, onConfirm, onClose }) => {
  const [servings, setServings] = useState(recipe.servings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(servings);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Hozzáadás a listához</h3>
          <p className="text-gray-500 text-sm mb-6">
            Hány főre készíted a(z) <strong>{recipe.name}</strong> receptet? Arányosan kiszámoljuk a hozzávalókat.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                type="button"
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-xl transition-colors"
              >
                <i className="fa-solid fa-minus"></i>
              </button>
              
              <div className="text-center w-20">
                <span className="text-3xl font-bold text-gray-800">{servings}</span>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Adag</p>
              </div>

              <button
                type="button"
                onClick={() => setServings(servings + 1)}
                className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-xl transition-colors"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Mégse
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 shadow-lg shadow-pink-200 transition-colors"
              >
                Hozzáadás
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServingsModal;
