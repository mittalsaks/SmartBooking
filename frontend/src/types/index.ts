// frontend/src/types/index.ts

export interface Offer {
  id: number;
  businessId: number;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  discountPrice: number; 
  capacity: number;
  bookedCount: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface OfferSlot {
  id: number;
  offerId: number;
  startTime: string;
  endTime: string;
  capacity: number;
  availableCount: number;
  status: string;
}