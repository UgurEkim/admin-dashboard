export interface Device {
  id: string;
  customerId: string;
  name: string;
  category: string;
  model: string;
  serialNumber: string;
  createdAt: string;
  brand?: string;
  notes?: string;
}
