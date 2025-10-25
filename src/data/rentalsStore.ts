export type RentalStatus = 'completed' | 'ongoing' | 'cancelled';

export type Rental = {
  id: string;
  customerId?: string;
  name: string; //
  vehicleId: string;
  startAt: string; // ISO
  endAt?: string; // ISO | undefined
  status: RentalStatus;
  priceCents?: number;
  notes?: string;
  createdAt?: string;
};

const STORAGE_KEY = 'rentals_store_v1';

const initialRentals: Rental[] = [
  {
    id: 'r1',
    customerId: 'c1',
    name: 'Nguyễn Văn A',
    vehicleId: 'vinfast-001',
    startAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    endAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    status: 'completed',
    priceCents: 150000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r2',
    customerId: 'c2',
    name: 'Trần Thị B',
    vehicleId: 'vinfast-002',
    startAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    status: 'ongoing',
    priceCents: 50000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r3',
    customerId: 'c5',
    name: 'Trần Thị C',
    vehicleId: 'vinfast-003',
    startAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    status: 'ongoing',
    priceCents: 100000,
    createdAt: new Date().toISOString(),
  },
];

function load(): Rental[] {
  try {
    // Developer convenience: visiting the app with ?resetRentals=1 will
    // overwrite persisted data with the initial sample rentals. This is
    // useful during development when you change sample data in source
    // but localStorage still holds the old values.
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('resetRentals') === '1') {
          save(initialRentals);
          return [...initialRentals];
        }
      } catch (e) {
        // ignore URL parsing errors
      }
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      save(initialRentals);
      return [...initialRentals];
    }
    return JSON.parse(raw) as Rental[];
  } catch {
    return [...initialRentals];
  }
}

function save(rentals: Rental[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rentals));
  } catch {
    // ignore storage errors
  }
}

export function getRentals(): Rental[] {
  return load();
}

export function findRental(id: string): Rental | undefined {
  return load().find((r) => r.id === id);
}

export function addRental(payload: Omit<Rental, 'id' | 'createdAt'>): Rental {
  const rentals = load();
  const newRental: Rental = {
    ...payload,
    id: `r${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  rentals.unshift(newRental);
  save(rentals);
  return newRental;
}

export function updateRental(id: string, patch: Partial<Omit<Rental, 'id' | 'createdAt'>>) {
  const rentals = load();
  const idx = rentals.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rentals[idx] = { ...rentals[idx], ...patch };
  save(rentals);
  return rentals[idx];
}

export function deleteRental(id: string) {
  const rentals = load();
  const next = rentals.filter((r) => r.id !== id);
  save(next);
  return next;
}

export function getRentalsByCustomer(customerId: string) {
  return load().filter((r) => r.customerId === customerId);
}

export function resetRentals() {
  save(initialRentals);
  return getRentals();
}
