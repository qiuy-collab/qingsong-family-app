
import { Organization, ServiceLog } from './types';

export const ORGANIZATIONS: Organization[] = [
  {
    id: '1',
    name: '阳光花园养老生活',
    rating: 4.9,
    reviews: 120,
    price: 5200,
    beds: 3,
    distance: '2.5公里外',
    tags: ['专业护理', '康复', '医疗保险'],
    image: 'https://picsum.photos/seed/org1/800/600',
  },
  {
    id: '2',
    name: '青松社区中心',
    rating: 4.7,
    reviews: 85,
    price: 3800,
    beds: 1,
    distance: '5.0公里外',
    tags: ['协助生活', '活动'],
    image: 'https://picsum.photos/seed/org2/800/600',
  },
  {
    id: '3',
    name: '金色年华疗养院',
    rating: 4.5,
    reviews: 42,
    price: 6500,
    beds: 0,
    status: '排队中',
    distance: '12.3公里外',
    tags: ['记忆护理', '医疗保险'],
    image: 'https://picsum.photos/seed/org3/800/600',
  }
];

export const SERVICE_LOGS: ServiceLog[] = [
  {
    time: '上午 08:00',
    title: '到达并签到',
    description: '护理员已到达住所。体温检测正常。',
    status: 'done',
    icon: 'check'
  },
  {
    time: '上午 08:30',
    title: '早餐协助',
    description: '协助进行均衡饮食摄入。',
    status: 'done',
    icon: 'restaurant',
    image: 'https://picsum.photos/seed/food/400/250'
  },
  {
    time: '上午 09:15',
    title: '生命体征检查: 血压 120/80',
    description: '检测结果一切正常。',
    status: 'done',
    icon: 'favorite',
    extra: '正常'
  },
  {
    time: '上午 10:00',
    title: '康复训练 - 下肢',
    description: '进行抬腿和阻力带练习。重点锻炼股四头肌力量。',
    status: 'pending',
    icon: 'fitness_center',
    extra: '进行中...'
  },
  {
    time: '中午 12:00',
    title: '午餐准备',
    description: '饮食限制：低钠。',
    status: 'pending',
    icon: 'restaurant'
  }
];
