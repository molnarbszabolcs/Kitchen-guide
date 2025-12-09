export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: string;
  externalLink?: string;
  createdAt: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  completed: boolean;
  fromRecipeId?: string;
}

export type Tab = 'recipes' | 'shopping';