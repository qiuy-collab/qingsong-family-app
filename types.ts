
export enum View {
  INTRO = 'INTRO',
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  ORG_DETAILS = 'ORG_DETAILS',
  SIGNING = 'SIGNING',
  HEALTH = 'HEALTH',
  DYNAMIC = 'DYNAMIC',
  SERVICE = 'SERVICE',
  PROFILE = 'PROFILE',
  ORDERS = 'ORDERS'
}

export interface Organization {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  beds: number;
  distance: string;
  tags: string[];
  image: string;
  status?: string;
}

export interface ServiceLog {
  time: string;
  title: string;
  description: string;
  status: 'done' | 'pending';
  icon: string;
  image?: string;
  extra?: string;
}

export interface Order {
  id: string;
  serviceName: string;
  orgName: string;
  price: number;
  date: string;
  status: 'active' | 'completed' | 'pending';
  type: 'base' | 'pro';
}
