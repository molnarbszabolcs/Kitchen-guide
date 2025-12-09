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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Add to List</h3>
          <p className="text-gray-500 text-sm mb-6">
            How many people are you cooking <strong>{recipe.name}</strong> for? We'll scale the ingredients for you.
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
                <p className="text-xs text-gray-500 uppercase tracking-wide">Servings</p>
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
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors"
              >
                Add Items
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServingsModal;