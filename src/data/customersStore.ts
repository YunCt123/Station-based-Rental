export type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalRentals: number;
  risk: 'low' | 'medium' | 'high';
  createdAt?: string;
};

const STORAGE_KEY = 'customers_store_v1';

const initialCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
    totalRentals: 12,
    risk: 'low',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0912345678',
    totalRentals: 5,
    risk: 'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    phone: '0987654321',
    totalRentals: 23,
    risk: 'low',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c4',
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    phone: '0977000111',
    totalRentals: 2,
    risk: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c5',
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    phone: '0966000222',
    totalRentals: 7,
    risk: 'medium',
    createdAt: new Date().toISOString(),
  },
];

function load(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      save(initialCustomers);
      return [...initialCustomers];
    }
    return JSON.parse(raw) as Customer[];
  } catch {
    return [...initialCustomers];
  }
}

function save(customers: Customer[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch {
    // ignore storage errors
  }
}

export function getCustomers(): Customer[] {
  return load();
}

export function findCustomer(id: string): Customer | undefined {
  return load().find((c) => c.id === id);
}

export function addCustomer(payload: Omit<Customer, 'id' | 'createdAt'>): Customer {
  const customers = load();
  const newCustomer: Customer = {
    ...payload,
    id: `c${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  customers.unshift(newCustomer);
  save(customers);
  return newCustomer;
}

export function updateCustomer(id: string, patch: Partial<Omit<Customer, 'id' | 'createdAt'>>) {
  const customers = load();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  customers[idx] = { ...customers[idx], ...patch };
  save(customers);
  return customers[idx];
}

export function deleteCustomer(id: string) {
  const customers = load();
  const next = customers.filter((c) => c.id !== id);
  save(next);
  return next;
}

export function resetCustomers() {
  save(initialCustomers);
  return getCustomers();
}