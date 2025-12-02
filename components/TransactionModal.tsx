import React from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Truck } from 'lucide-react';
import { TransactionFormState, Product } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'in' | 'out';
  isEditing: boolean;
  form: TransactionFormState;
  setForm: (form: TransactionFormState) => void;
  products: Product[];
  onSave: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  type,
  isEditing,
  form,
  setForm,
  products,
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
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          {type === 'in' ? <ArrowUpCircle className="text-blue-600"/> : <ArrowDownCircle className="text-red-600"/>}
          {isEditing ? '내역 수정' : (type === 'in' ? '입고 처리' : '출고 처리')}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">날짜</label>
            <input
              type="date"
              className="w-full border p-2 rounded mt-1"
              value={form.date}
              onChange={e => setForm({...form, date: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Truck className="h-4 w-4" /> 거래처 {type === 'in' ? '(공급업체)' : '(납품처)'}
            </label>
            <input
              type="text"
              placeholder={type === 'in' ? "공급업체명 입력" : "납품처/고객명 입력"}
              className="w-full border p-2 rounded mt-1"
              value={form.company}
              onChange={e => setForm({...form, company: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">제품 선택</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={form.productId}
              onChange={e => setForm({...form, productId: e.target.value})}
              disabled={isEditing} 
            >
              <option value="">제품을 선택하세요</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (현재고: {p.stock})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">수량</label>
            <input
              type="number"
              min="1"
              className="w-full border p-2 rounded mt-1"
              value={form.quantity}
              onChange={e => setForm({...form, quantity: e.target.value})}
            />
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
            className={`px-4 py-2 text-white rounded ${type === 'in' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isEditing ? '수정 확인' : '확인'}
          </button>
        </div>
      </div>
    </div>
  );
};