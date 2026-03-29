export interface AssistantItem {
  id: string;
  label: string;
  answer: string;
}

export const ASSISTANT_ITEMS: AssistantItem[] = [
  {
    id: 'app-overview',
    label: '这个 App 能做什么',
    answer:
      '这是青松智陪家属端，主要帮助家属查看机构信息、跟进签约流程、了解长辈健康数据、查看长辈动态，并追踪服务执行情况。首页可以筛选照护机构，底部导航可以切换到数据、动态、服务和个人中心。',
  },
  {
    id: 'health-data',
    label: '怎么查看长辈健康数据',
    answer:
      '点击底部导航里的“数据”页面，就能看到长辈的健康看板，包括血压、心率、最近同步时间和趋势图。如果页面出现异常提醒，也可以先在这里查看最新状态。',
  },
  {
    id: 'dynamic-feed',
    label: '怎么查看长辈动态',
    answer:
      '点击底部导航里的“动态”页面，可以查看长辈的饮食、活动和日常记录，还能点赞、评论、留言，或直接发起视频通话，方便家属及时了解长辈近况。',
  },
  {
    id: 'service-tracking',
    label: '怎么联系机构或查看服务进度',
    answer:
      '在首页点进机构卡片后可以查看机构详情和签约流程；需要跟进服务时，进入底部导航里的“服务”页面查看服务日志、当前进度和执行情况，方便了解机构服务是否按计划完成。',
  },
];
