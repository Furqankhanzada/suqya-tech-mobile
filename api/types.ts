// Auth Types
export type Collection = "employee" | "customer" | null | undefined;

export interface Session {
  createdAt: string;
  expiresAt: string;
  id: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  username: string;
  collection: Collection;
  address: string;
  contactNumber: string;
  nic?: string;
  sessions: Session[];
  createdAt: string;
  updatedAt: string;
}


// Trip Types
export interface Area {
  name: string;
  id: string;
}

export interface BlockInfo {
  name: string;
  area: Area;
  id: string;
}

export interface Employee {
  name: string;
  id: string;
}

export interface Trip {
  createdAt: string;
  updatedAt: string;
  from: string;
  areas: Area[];
  blocks: BlockInfo[];
  bottles: number;
  tripAt: string;
  employee: Employee[];
  status: string;
  priority: Priority[];
  id: string;
}

export interface EmployeeTripStats {
  completed: number;
  inprogress: number;
  total: number;
}


// Transaction Types
export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL';

export type ContactNumber = {
  id: string;
  type: 'whatsapp' | 'phone' | string;
  contactNumber: string;
}

export type Payment = {
  type?: ('online' | 'cash') | null;
  amount?: number | null;
  paidAt?: string | null;
  /**
   * Anything speacial that you want to mention?
   */
  comments?: string | null;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
}

export type Customer = {
  id: string;
  name: string;
  address: string;
  coordinates?: Coordinates;
  rate: number;
  balance: number;
  advance: number;
  status: 'active' | 'inactive';
  bottlesAtHome: number;
  deliveryFrequencyDays: number;
  contactNumbers: ContactNumber[];
  area: Area;
  block: BlockInfo;
  createdAt: string;
  updatedAt: string;
};

export interface Analytics {
  consumptionRate: number;
  adjustedConsumptionRate: number;
  weeklyConsumption: number;
  daysUntilDelivery: number;
  nextDeliveryDate: string;
  priority: Priority;
}

export interface Transaction {
  createdAt: string;
  updatedAt: string;
  trip: Trip | string;
  customer: Customer;
  status: string;
  bottleGiven: number;
  bottleTaken: number;
  remainingBottles: number;
  transactionAt: string;
  total: number;
  analytics: Analytics;
  id: string;
  consumptionRate: number;
  weeklyConsumption: number;
  adjustedConsumption: number;
  daysUntilDelivery: number;
  nextDeliveryDate: string;
  priority: Priority;
  payment?: Payment;
}

