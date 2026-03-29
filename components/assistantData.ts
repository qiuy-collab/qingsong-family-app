import type { AssistantSuggestion } from '../types';

export const ASSISTANT_SUGGESTIONS: AssistantSuggestion[] = [
  {
    id: 'app-overview',
    label: '这个 App 能做什么',
    prompt: '请用家属容易理解的方式介绍一下这个 App 的核心功能。',
  },
  {
    id: 'health-data',
    label: '怎么查看长辈健康数据',
    prompt: '请告诉我怎么在家属端查看长辈的健康数据和趋势。',
  },
  {
    id: 'dynamic-feed',
    label: '怎么查看长辈动态',
    prompt: '请告诉我怎么查看长辈的生活动态，以及我能做哪些互动。',
  },
  {
    id: 'service-tracking',
    label: '怎么联系机构或查看服务进度',
    prompt: '请告诉我怎么联系机构、查看服务日志和订单进度。',
  },
];
