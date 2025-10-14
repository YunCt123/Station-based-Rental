export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalRentals: number;
  lastActive: string; // iso date or human text
  risk: 'low' | 'medium' | 'high';
};

export const customers: Customer[] = [
  { id: 'c01', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901234567', totalRentals: 12, lastActive: '2025-10-06T09:12:00Z', risk: 'low' },
  { id: 'c02', name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0912345678', totalRentals: 5, lastActive: '2025-10-05T14:22:00Z', risk: 'medium' },
  { id: 'c03', name: 'Lê Văn C', email: 'levanc@example.com', phone: '0987654321', totalRentals: 23, lastActive: '2025-10-04T08:00:00Z', risk: 'low' },
  { id: 'c04', name: 'Phạm Thị D', email: 'phamthid@example.com', phone: '0977000111', totalRentals: 2, lastActive: '2025-09-28T12:30:00Z', risk: 'high' },
  { id: 'c05', name: 'Hoàng Văn E', email: 'hoangvane@example.com', phone: '0966000222', totalRentals: 7, lastActive: '2025-10-01T16:45:00Z', risk: 'medium' }
];
