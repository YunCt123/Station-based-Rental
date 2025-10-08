import { customers as initial } from './customers';
import type { Customer } from './customers';

let store: Customer[] = [...initial];

export const getCustomers = (): Customer[] => store;

export const addCustomer = (c: Customer) => {
  store = [c, ...store];
};

export const findCustomer = (id: string | undefined): Customer | undefined => {
  if (!id) return undefined;
  return store.find(s => s.id === id);
};
