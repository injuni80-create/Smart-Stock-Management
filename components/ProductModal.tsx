import React from 'react';
import { X } from 'lucide-react';
import { ProductFormState } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: ProductFormState;
  setForm: (form: ProductFormState) => void;
  onSave: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  isEditing,
  form,
  setForm,
  onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-xl w-96 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-bold mb-4">
          {isEditing ? '제품 정보 수정' : '새 제품 등록'}
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="제품 코드 (예: P-001)"
            className="w-full border p-2 rounded"
            value={form.code}
            onChange={e => setForm({...form, code: e.target.value})}
          />
          <input
            type="text"
            placeholder="제품명"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="카테고리"
            className="w-full border p-2 rounded"
            value={form.category}
            onChange={e => setForm({...form, category: e.target.value})}
          />
          <div className="flex gap-2">
            <div className="w-1/2">
                <label className="text-xs text-gray-500">초기 재고</label>
                <input
                type="number"
                placeholder="초기 재고"
                className="w-full border p-2 rounded"
                value={form.stock}
                onChange={e => setForm({...form, stock: e.target.value})}
              />
            </div>
            <div className="w-1/2">
              <label className="text-xs text-gray-500">적정 재고(경고 기준)</label>
              <input
                type="number"
                placeholder="적정 재고"
                className="w-full border p-2 rounded"
                value={form.safetyStock}
                onChange={e => setForm({...form, safetyStock: e.target.value})}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditing ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
};