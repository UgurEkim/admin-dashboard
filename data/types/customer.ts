export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneCountryCode?: string;
  street?: string;
  postalCode?: string;
  houseNumber?: string;
  city?: string;
  country?: string;
  createdAt: string;
  notes?: string;
}
