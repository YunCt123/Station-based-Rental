export type EmployeeStatus = 'active' | 'inactive' | 'suspended';

export type Employee = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'staff' | 'manager' | 'support';
  stationId?: string;
  status?: EmployeeStatus;
  createdAt?: string;
};

const STORAGE_KEY = 'employees_store_v1';

const initialEmployees: Employee[] = [
  {
    id: 'e1',
    name: 'Nguyễn Văn Quân',
    email: 'quan.nguyen@example.com',
    phone: '+84 912 345 678',
    role: 'manager',
    stationId: 's1',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    name: 'Trần Thị Lan',
    email: 'lan.tran@example.com',
    phone: '+84 933 222 111',
    role: 'staff',
    stationId: 's2',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

function load(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      save(initialEmployees);
      return [...initialEmployees];
    }
    return JSON.parse(raw) as Employee[];
  } catch {
    return [...initialEmployees];
  }
}

function save(items: Employee[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function getEmployees(): Employee[] {
  return load();
}

export function findEmployee(id: string): Employee | undefined {
  return load().find((e) => e.id === id);
}

export function addEmployee(payload: Omit<Employee, 'id' | 'createdAt'>): Employee {
  const items = load();
  const newItem: Employee = {
    ...payload,
    id: `e${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  save(items);
  return newItem;
}

export function updateEmployee(id: string, patch: Partial<Omit<Employee, 'id' | 'createdAt'>>) {
  const items = load();
  const idx = items.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  save(items);
  return items[idx];
}

export function deleteEmployee(id: string) {
  const items = load();
  const next = items.filter((e) => e.id !== id);
  save(next);
  return next;
}

export function resetEmployees() {
  save(initialEmployees);
  return getEmployees();
}

export default {
  getEmployees,
  findEmployee,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  resetEmployees,
};
