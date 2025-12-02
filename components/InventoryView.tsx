import React from 'react';
import { Search, ArrowUpCircle, ArrowDownCircle, Plus, ChevronUp, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { Product, SortConfig } from '../types';

interface InventoryViewProps {
  products: Product[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortConfig: SortConfig;
  requestSort: (key: keyof Product) => void;
  openTransactionModal: (type: 'in' | 'out') => void;
  openAddModal: () => void;
  openEditModal: (product: Product) => void;
  requestDeleteProduct: (id: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  searchTerm,
  setSearchTerm,
  sortConfig,
  requestSort,
  openTransactionModal,
  openAddModal,
  openEditModal,
  requestDeleteProduct
}) => {
  const getSortIcon = (key: keyof Product) => {
    if (sortConfig.key !== key) {
      return <div className="w-4 h-4 ml-1 inline-block opacity-0 group-hover:opacity-30"><ChevronUp className="w-4 h-4" /></div>;
    }
    return sortConfig.direction === 'ascending' ? 
      <ChevronUp className="w-4 h-4 ml-1 inline-block text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 ml-1 inline-block text-blue-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-12rem)]">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="제품명, 코드 또는 카테고리 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => openTransactionModal('in')}
            className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            입고
          </button>
          <button
            onClick={() => openTransactionModal('out')}
            className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
          >
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            출고
          </button>
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            제품 추가
          </button>
        </div>
      </div>
      
      <div className="overflow-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200 relative">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {[
                { key: 'category', label: '카테고리', align: 'left' },
                { key: 'code', label: '코드', align: 'left' },
                { key: 'name', label: '제품명', align: 'left' },
                { key: 'stock', label: '현재 재고', align: 'right' },
                { key: 'safetyStock', label: '적정 재고', align: 'right' },
              ].map((col) => (
                <th 
                  key={col.key}
                  onClick={() => requestSort(col.key as keyof Product)}
                  className={`px-6 py-3 text-${col.align} text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group select-none`}
                >
                  <div className={`flex items-center ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    {col.label}
                    {getSortIcon(col.key as keyof Product)}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 group">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${product.stock < product.safetyStock ? 'text-red-600' : 'text-gray-900'}`}>
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{product.safetyStock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {product.stock < product.safetyStock ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">부족</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">정상</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => openEditModal(product)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="제품 수정"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => requestDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="제품 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
        총 {products.length}개의 제품이 표시됨
      </div>
    </div>
  );
};