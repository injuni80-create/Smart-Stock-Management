import { Product, HistoryItem } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, code: 'P-001', name: '고급 사무용 의자', category: '가구', stock: 45, safetyStock: 10 },
  { id: 2, code: 'P-002', name: '스탠딩 데스크', category: '가구', stock: 8, safetyStock: 15 },
  { id: 3, code: 'P-003', name: '무선 마우스', category: '전자제품', stock: 120, safetyStock: 30 },
  { id: 4, code: 'P-004', name: '기계식 키보드', category: '전자제품', stock: 55, safetyStock: 20 },
  { id: 5, code: 'P-005', name: '27인치 모니터', category: '전자제품', stock: 3, safetyStock: 5 },
  { id: 6, code: 'P-006', name: 'USB-C 허브', category: '악세사리', stock: 80, safetyStock: 25 },
  { id: 7, code: 'P-007', name: '노트북 거치대', category: '악세사리', stock: 42, safetyStock: 15 },
];

export const INITIAL_HISTORY: HistoryItem[] = [
  { id: 1, type: 'in', date: '2023-10-25', productId: 1, productName: '고급 사무용 의자', quantity: 50, company: '체어메이커(주)' },
  { id: 2, type: 'out', date: '2023-10-26', productId: 1, productName: '고급 사무용 의자', quantity: 5, company: '스타트업 A사' },
  { id: 3, type: 'in', date: '2023-10-27', productId: 3, productName: '무선 마우스', quantity: 100, company: '로지텍 도매' },
];