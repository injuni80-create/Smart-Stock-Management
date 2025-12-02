import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { DeleteModalState } from '../types';

interface DeleteModalProps {
  modalState: DeleteModalState;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ modalState, onClose, onConfirm }) => {
  if (!modalState.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-xl w-80 relative">
        <div className="text-center mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">삭제 확인</h3>
          <p className="text-sm text-gray-500 mt-2">
            {modalState.type === 'history' 
              ? '이 내역을 삭제하면 재고 수량이 자동으로 원상복구됩니다. 정말 삭제하시겠습니까?' 
              : '정말 이 제품을 삭제하시겠습니까?'}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};