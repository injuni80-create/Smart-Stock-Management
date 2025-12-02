import React, { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_HISTORY } from './constants';
import { Product, HistoryItem, SortConfig, ProductFormState, TransactionFormState, DeleteModalState } from './types';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { HistoryView } from './components/HistoryView';
import { ProductModal } from './components/ProductModal';
import { TransactionModal } from './components/TransactionModal';
import { DeleteModal } from './components/DeleteModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'history' | 'dashboard'>('inventory');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
  
  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ isOpen: false, type: null, id: null });
  
  // Form states
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('in'); 
  const [historyEditingId, setHistoryEditingId] = useState<number | null>(null); 
  const [editingId, setEditingId] = useState<number | null>(null); 

  const [productForm, setProductForm] = useState<ProductFormState>({ code: '', name: '', category: '', stock: 0, safetyStock: 0 });
  const [transaction, setTransaction] = useState<TransactionFormState>({ productId: '', quantity: 1, date: new Date().toISOString().split('T')[0], company: '' });

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.includes(searchTerm)
    );
  }, [products, searchTerm]);

  // Sort Logic
  const sortedProducts = useMemo(() => {
    let sortableItems = [...filteredProducts];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // @ts-ignore - dynamic key access
        let aValue = a[sortConfig.key];
        // @ts-ignore - dynamic key access
        let bValue = b[sortConfig.key];
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProducts, sortConfig]);

  const requestSort = (key: keyof Product) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // CSV Export Logic
  const handleExportToCSV = () => {
    const headers = ['카테고리', '제품코드', '제품명', '현재재고', '적정재고', '상태'];
    const rows = products.map(p => [
      p.category,
      p.code,
      `"${p.name}"`, // Quote name to handle commas
      p.stock,
      p.safetyStock,
      p.stock < p.safetyStock ? '부족' : '정상'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `재고현황_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import Logic
  const handleImportFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      // Remove BOM if present
      const cleanContent = content.startsWith('\uFEFF') ? content.slice(1) : content;
      
      const lines = cleanContent.split('\n');
      if (lines.length < 2) {
        alert('데이터가 없는 파일이거나 형식이 올바르지 않습니다.');
        return;
      }

      // Simple CSV parser handling quotes
      const parseCSVLine = (text: string) => {
        const result = [];
        let current = '';
        let inQuote = false;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"') {
            inQuote = !inQuote;
          } else if (char === ',' && !inQuote) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        
        // Remove surrounding quotes if present and handle double quotes
        return result.map(field => field.replace(/^"|"$/g, '').replace(/""/g, '"'));
      };

      let successCount = 0;
      let failCount = 0;
      const newItems: Product[] = [];

      // Parse and collect data
      // Skip header (index 0)
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        try {
          const columns = parseCSVLine(lines[i]);
          
          // Expected columns: Category, Code, Name, Stock, SafetyStock, Status
          // Minimum 5 columns required
          if (columns.length < 5) {
            failCount++;
            continue;
          }
          
          const category = columns[0];
          const code = columns[1];
          const name = columns[2];
          const stock = parseInt(columns[3], 10);
          const safetyStock = parseInt(columns[4], 10);

          if (!code || !name || isNaN(stock)) {
            failCount++;
            continue;
          }

          newItems.push({
            id: 0, // Placeholder, will set correct ID during merge
            code,
            name,
            category,
            stock,
            safetyStock
          });
          successCount++;
        } catch (error) {
          failCount++;
        }
      }

      if (successCount === 0) {
        alert('가져올 수 있는 유효한 데이터가 없습니다.');
        event.target.value = '';
        return;
      }

      // Merge Strategy: Update existing by Code, Append new
      setProducts(prevProducts => {
        const productMap = new Map<string, Product>();
        prevProducts.forEach(p => productMap.set(p.code, p));

        const nextIdStart = Math.max(0, ...prevProducts.map(p => p.id)) + 1;
        
        let addedCount = 0;
        
        newItems.forEach(item => {
          if (productMap.has(item.code)) {
            // Update existing
            const existing = productMap.get(item.code)!;
            productMap.set(item.code, {
              ...existing,
              name: item.name,
              category: item.category,
              stock: item.stock,
              safetyStock: item.safetyStock
            });
          } else {
            // Add new
            productMap.set(item.code, {
              ...item,
              id: nextIdStart + addedCount
            });
            addedCount++;
          }
        });

        return Array.from(productMap.values());
      });

      alert(`총 ${successCount}건 처리 완료 (새로 추가/업데이트됨)${failCount > 0 ? `, 실패 ${failCount}건` : ''}`);
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleCategoryClick = (category: string) => {
    setSearchTerm(category);
    setActiveTab('inventory');
  };

  // Product Management Logic
  const openAddModal = () => {
    setEditingId(null);
    setProductForm({ code: '', name: '', category: '', stock: 0, safetyStock: 0 });
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setProductForm({ 
        code: product.code,
        name: product.name,
        category: product.category,
        stock: product.stock,
        safetyStock: product.safetyStock
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.code) return;

    if (editingId) {
      setProducts(products.map(p => 
        p.id === editingId ? { 
            ...p, 
            ...productForm, 
            stock: Number(productForm.stock), 
            safetyStock: Number(productForm.safetyStock) 
        } : p
      ));
    } else {
      const newProduct: Product = {
        id: Date.now(),
        code: productForm.code,
        name: productForm.name,
        category: productForm.category,
        stock: Number(productForm.stock),
        safetyStock: Number(productForm.safetyStock)
      };
      setProducts([...products, newProduct]);
    }
    setIsProductModalOpen(false);
    setProductForm({ code: '', name: '', category: '', stock: 0, safetyStock: 0 });
    setEditingId(null);
  };

  // Deletion Logic
  const requestDeleteProduct = (id: number) => {
    setDeleteModal({ isOpen: true, type: 'product', id });
  };

  const requestDeleteHistory = (id: number) => {
    setDeleteModal({ isOpen: true, type: 'history', id });
  };

  const executeDelete = () => {
    const { type, id } = deleteModal;

    if (type === 'product' && id !== null) {
      setProducts(products.filter(p => p.id !== id));
    } else if (type === 'history' && id !== null) {
      const record = history.find(h => h.id === id);
      if (record) {
        const targetProduct = products.find(p => p.id === record.productId);
        if (targetProduct) {
          const updatedProducts = products.map(p => {
            if (p.id === targetProduct.id) {
              let newStock = p.stock;
              if (record.type === 'in') newStock -= record.quantity;
              else newStock += record.quantity;
              return { ...p, stock: newStock };
            }
            return p;
          });
          setProducts(updatedProducts);
        }
        setHistory(history.filter(h => h.id !== id));
      }
    }
    setDeleteModal({ isOpen: false, type: null, id: null });
  };

  // Transaction Logic
  const openTransactionModal = (type: 'in' | 'out') => {
    setTransactionType(type);
    setHistoryEditingId(null); 
    setTransaction({ productId: '', quantity: 1, date: new Date().toISOString().split('T')[0], company: '' });
    setIsTransactionModalOpen(true);
  };

  const openHistoryEditModal = (record: HistoryItem) => {
    setTransactionType(record.type);
    setHistoryEditingId(record.id); 
    setTransaction({ 
      productId: record.productId, 
      quantity: record.quantity, 
      date: record.date, 
      company: record.company || '' 
    });
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSave = () => {
    const targetId = parseInt(String(transaction.productId));
    const targetProduct = products.find(p => p.id === targetId);
    if (!targetProduct) return;

    const newQty = parseInt(String(transaction.quantity));
    const newProducts = [...products];

    // Revert previous transaction effect if editing
    if (historyEditingId) {
      const oldRecord = history.find(h => h.id === historyEditingId);
      if (oldRecord) {
        const oldProductIndex = newProducts.findIndex(p => p.id === oldRecord.productId);
        if (oldProductIndex > -1) {
          if (oldRecord.type === 'in') {
            newProducts[oldProductIndex].stock -= oldRecord.quantity; 
          } else {
            newProducts[oldProductIndex].stock += oldRecord.quantity; 
          }
        }
      }
    }

    // Apply new transaction effect
    const productIndex = newProducts.findIndex(p => p.id === targetId);
    if (productIndex > -1) {
      if (transactionType === 'in') {
        newProducts[productIndex].stock += newQty;
      } else {
        newProducts[productIndex].stock -= newQty;
      }
    }

    setProducts(newProducts);

    if (historyEditingId) {
      setHistory(history.map(h => h.id === historyEditingId ? {
        ...h,
        type: transactionType,
        date: transaction.date,
        productId: targetId,
        productName: targetProduct.name,
        quantity: newQty,
        company: transaction.company || '-'
      } : h));
    } else {
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        type: transactionType,
        date: transaction.date,
        productId: targetId,
        productName: targetProduct.name,
        quantity: newQty,
        company: transaction.company || '-'
      };
      setHistory([newHistoryItem, ...history]);
    }

    setIsTransactionModalOpen(false);
    setTransaction({ productId: '', quantity: 1, date: new Date().toISOString().split('T')[0], company: '' });
    setHistoryEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">스마트 재고 관리</h1>
            <h1 className="text-xl font-bold text-gray-900 sm:hidden">재고 관리</h1>
          </div>
          <nav className="flex gap-2 sm:gap-4">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              대시보드
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              재고 현황
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              이력
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView 
            products={products} 
            history={history}
            onExport={handleExportToCSV} 
            onImport={handleImportFromCSV} 
            onCategoryClick={handleCategoryClick}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView 
            products={sortedProducts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortConfig={sortConfig}
            requestSort={requestSort}
            openTransactionModal={openTransactionModal}
            openAddModal={openAddModal}
            openEditModal={openEditModal}
            requestDeleteProduct={requestDeleteProduct}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView 
            history={history}
            openHistoryEditModal={openHistoryEditModal}
            requestDeleteHistory={requestDeleteHistory}
          />
        )}
      </main>

      <ProductModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        isEditing={!!editingId}
        form={productForm}
        setForm={setProductForm}
        onSave={handleSaveProduct}
      />

      <TransactionModal 
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        type={transactionType}
        isEditing={!!historyEditingId}
        form={transaction}
        setForm={setTransaction}
        products={products}
        onSave={handleTransactionSave}
      />

      <DeleteModal 
        modalState={deleteModal}
        onClose={() => setDeleteModal({ isOpen: false, type: null, id: null })}
        onConfirm={executeDelete}
      />
    </div>
  );
}