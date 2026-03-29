import type {
  DynamicComment,
  DynamicItem,
  HealthMetrics,
  HealthSummary,
  InstitutionDetail,
  Order,
  Organization,
  ServiceLog,
} from '../types';
import { apiRequest } from './apiClient';

export const appDataService = {
  listInstitutions() {
    return apiRequest<Organization[]>('/api/v1/institutions');
  },
  getInstitutionDetail(institutionId: string) {
    return apiRequest<InstitutionDetail>(`/api/v1/institutions/${institutionId}`);
  },
  getHealthSummary(elderId: string) {
    return apiRequest<HealthSummary>(`/api/v1/elders/${elderId}/health/summary`);
  },
  getHealthMetrics(elderId: string, range: '7d' | '30d') {
    return apiRequest<HealthMetrics>(`/api/v1/elders/${elderId}/health/metrics?range=${range}`);
  },
  listDynamics(elderId: string) {
    return apiRequest<DynamicItem[]>(`/api/v1/elders/${elderId}/dynamics`);
  },
  toggleDynamicLike(dynamicId: string) {
    return apiRequest<{ id: string; is_liked: boolean; likes: number }>(`/api/v1/dynamics/${dynamicId}/like`, {
      method: 'POST',
    });
  },
  addDynamicComment(dynamicId: string, content: string) {
    return apiRequest<DynamicComment>(`/api/v1/dynamics/${dynamicId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
  listServiceLogs(elderId: string, dayIndex: number) {
    return apiRequest<ServiceLog[]>(`/api/v1/elders/${elderId}/service-logs?day_index=${dayIndex}`);
  },
  listOrders() {
    return apiRequest<Order[]>('/api/v1/orders');
  },
  signOrder(payload: {
    institution_id: string;
    elder_id: string;
    name: string;
    id_number: string;
    phone: string;
    relationship: string;
    is_pro_package: boolean;
    photo?: string | null;
    signature_data?: string | null;
  }) {
    return apiRequest<Order>('/api/v1/orders/sign', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  submitOrderReview(orderId: string, rating: number, comment: string) {
    return apiRequest<{ status: string }>(`/api/v1/orders/${orderId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },
};
