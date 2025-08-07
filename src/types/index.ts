export interface CoffeeBean {
  id: string;
  name: string;
  price: number;
  weight: number;
  flavorProfile: string[];
  roastDate?: Date;
  purchaseDate?: Date;
  notes?: string;
  type: 'purchased' | 'wishlist';
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  gramsPerBrew: number;
  restPeriodDays: number;
}

export interface CoffeeStats {
  totalPurchased: number;
  totalWishlist: number;
  totalCost: number;
  remainingCups: number;
  beansInRestPeriod: number;
  beansInBestPeriod: number;
}