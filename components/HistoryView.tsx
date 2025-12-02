import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  openHistoryEditModal: (record: HistoryItem) => void;
  requestDeleteHistory: (id: number) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, openHistoryEditModal, requestDeleteHistory }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold">최근 입출고 내역</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">구분</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">거래처</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품명</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 group">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    record.type === 'in' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {record.type === 'in' ? '입고' : '출고'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.company}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.productName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{record.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => openHistoryEditModal(record)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="내역 수정"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => requestDeleteHistory(record.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="내역 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  기록된 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};