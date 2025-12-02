export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  stock: number;
  safetyStock: number;
}

export interface HistoryItem {
  id: number;
  type: 'in' | 'out';
  date: string;
  productId: number;
  productName: string;
  quantity: number;
  company: string;
}

export interface SortConfig {
  key: keyof Product | null;
  direction: 'ascending' | 'descending';
}

export interface ProductFormState {
  code: string;
  name: string;
  category: string;
  stock: number | string;
  safetyStock: number | string;
}

export interface TransactionFormState {
  productId: string | number;
  quantity: number | string;
  date: string;
  company: string;
}

export interface DeleteModalState {
  isOpen: boolean;
  type: 'product' | 'history' | null;
  id: number | null;
}