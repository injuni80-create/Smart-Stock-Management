import React, { useMemo } from 'react';
import { Package, LayoutDashboard, AlertCircle, FileSpreadsheet, Upload } from 'lucide-react';
import { Product, HistoryItem } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DashboardViewProps {
  products: Product[];
  history: HistoryItem[];
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryClick: (category: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export const DashboardView: React.FC<DashboardViewProps> = ({ products, history, onExport, onImport, onCategoryClick }) => {
  const totalStock = products.reduce((acc, cur) => acc + cur.stock, 0);
  const lowStockItems = products.filter(p => p.stock < p.safetyStock).length;
  const totalProducts = products.length;

  // Prepare data for Stock by Category (Pie Chart)
  const categoryData = useMemo(() => {
    const data = products.reduce((acc, product) => {
      const existing = acc.find(item => item.name === product.category);
      if (existing) {
        existing.value += product.stock;
      } else {
        acc.push({ name: product.category, value: product.stock });
      }
      return acc;
    }, [] as { name: string, value: number }[]);
    return data.sort((a, b) => b.value - a.value);
  }, [products]);

  // Prepare data for Transaction Activity (Bar Chart)
  const transactionData = useMemo(() => {
    // Get unique dates from history, sort them
    const dates = Array.from(new Set(history.map(item => item.date))).sort() as string[];
    
    // Take last 7 days available or all if less
    const recentDates = dates.slice(-7);

    return recentDates.map((date: string) => {
      const dayItems = history.filter(h => h.date === date);
      const inQty = dayItems.filter(h => h.type === 'in').reduce((sum, h) => sum + h.quantity, 0);
      const outQty = dayItems.filter(h => h.type === 'out').reduce((sum, h) => sum + h.quantity, 0);
      
      return {
        date: date.substring(5), // Show "MM-DD"
        in: inQty,
        out: outQty
      };
    });
  }, [history]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors text-sm font-medium cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          CSV 가져오기
          <input 
            type="file" 
            accept=".csv" 
            onChange={onImport}
            className="hidden" 
          />
        </label>
        <button 
          onClick={onExport}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm transition-colors text-sm font-medium"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Google Sheet 내보내기 (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">총 제품 수</p>
              <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">총 재고 수량</p>
              <p className="text-3xl font-bold text-gray-900">{totalStock}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <LayoutDashboard className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">재고 부족 경고</p>
              <p className="text-3xl font-bold text-red-600">{lowStockItems}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800">최근 입출고 현황 (수량)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={transactionData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '0.375rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                />
                <Legend />
                <Bar dataKey="in" fill="#3b82f6" name="입고" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" fill="#ef4444" name="출고" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            카테고리별 재고 분포 
            <span className="text-xs font-normal text-gray-500 ml-2">(클릭하여 필터링)</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  onClick={(data) => onCategoryClick(data.name)}
                  className="cursor-pointer"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="cursor-pointer hover:opacity-80 transition-opacity stroke-white stroke-2"
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}개`, '재고']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4">재고 부족 알림 (적정 재고 미만)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">현재 재고</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">적정 재고</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.filter(p => p.stock < p.safetyStock).map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.safetyStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      부족
                    </span>
                  </td>
                </tr>
              ))}
              {products.filter(p => p.stock < p.safetyStock).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    재고 부족 상품이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};