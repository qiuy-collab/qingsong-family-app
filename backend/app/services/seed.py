from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.assistant import ChatMessage, ChatSession
from app.models.dynamics import Dynamic, DynamicComment, DynamicLike
from app.models.health import Elder, HealthMetric
from app.models.institution import Institution, InstitutionReview, InstitutionService, InstitutionTag
from app.models.order import Order, OrderReview
from app.models.profile import Profile
from app.models.service_log import ServiceLog


def _upsert_list(existing: Iterable, items: list):
    return len(list(existing)) >= len(items)


def seed_demo_data(db: Session) -> None:
    settings = get_settings()
    if db.query(Profile).count() > 0:
        return

    profile = Profile(
        id=settings.demo_profile_id,
        full_name="张女士",
        phone="13800138000",
        avatar_url="https://picsum.photos/seed/family-user/200/200",
        is_demo_user=True,
    )
    db.add(profile)

    institutions = [
        Institution(
            id="inst-1",
            name="阳光花园养老生活馆",
            city="北京市",
            district="朝阳区",
            address="望京东路 18 号",
            rating=4.9,
            reviews_count=128,
            base_price=5200,
            total_beds=200,
            available_beds=3,
            distance_desc="2.5 公里",
            hero_image_url="https://picsum.photos/seed/org1/800/600",
            care_type="协助照护与康复",
            description="提供生活照料、康复训练、慢病管理和家属协同服务。",
        ),
        Institution(
            id="inst-2",
            name="青松社区照护中心",
            city="北京市",
            district="海淀区",
            address="中关村南大街 58 号",
            rating=4.7,
            reviews_count=85,
            base_price=3800,
            total_beds=120,
            available_beds=1,
            distance_desc="5.0 公里",
            hero_image_url="https://picsum.photos/seed/org2/800/600",
            care_type="社区陪护与日间照料",
            description="适合日间托养、康复过渡和家属临时托管。",
        ),
        Institution(
            id="inst-3",
            name="金色年华疗养院",
            city="北京市",
            district="丰台区",
            address="南四环西路 210 号",
            rating=4.5,
            reviews_count=42,
            base_price=6500,
            total_beds=150,
            available_beds=0,
            distance_desc="12.3 公里",
            hero_image_url="https://picsum.photos/seed/org3/800/600",
            care_type="记忆照护与医疗协同",
            description="针对高龄和记忆照护需求提供长期住养服务。",
        ),
    ]
    db.add_all(institutions)

    for institution, tags in [
        (institutions[0], ["专业护理", "康复", "医保支持"]),
        (institutions[1], ["协助生活", "活动丰富"]),
        (institutions[2], ["记忆照护", "医保支持"]),
    ]:
        db.add_all([InstitutionTag(institution=institution, label=tag) for tag in tags])

    db.add_all(
        [
            InstitutionService(
                institution=institutions[0],
                title="康复中心",
                description="提供术后恢复、下肢训练和关节活动度训练。",
                icon="monitor_heart",
                highlight_1="理疗",
                highlight_2="言语训练",
            ),
            InstitutionService(
                institution=institutions[0],
                title="营养膳食",
                description="结合老人慢病指标做低盐低糖饮食搭配。",
                icon="restaurant",
                highlight_1="低糖",
                highlight_2="送餐服务",
            ),
        ]
    )
    db.add(
        InstitutionReview(
            institution=institutions[0],
            author_name="张先生",
            relation_label="亲属",
            stay_duration_label="入住 2 年",
            content="护理人员沟通及时，康复安排很有计划，家属可以随时看到动态。",
            created_at_label="2 天前",
        )
    )

    elder = Elder(
        id=settings.demo_elder_id,
        institution=institutions[0],
        name="林奶奶",
        age=82,
        gender="女",
        avatar_url="https://i.pravatar.cc/150?u=elderly1",
        room_number="2 号楼 302",
        status_text="状态良好",
    )
    db.add(elder)

    now = datetime.now(timezone.utc)
    for index, (bp, hr, abnormal) in enumerate(
        [
            ((118, 78), 68, False),
            ((120, 80), 72, False),
            ((125, 82), 65, False),
            ((122, 80), 70, False),
            ((130, 85), 68, False),
            ((124, 81), 75, False),
            ((145, 95), 72, True),
        ]
    ):
        recorded_at = now - timedelta(days=6 - index)
        db.add(
            HealthMetric(
                elder=elder,
                range_bucket="7d",
                systolic=bp[0],
                diastolic=bp[1],
                bpm=hr,
                recorded_at=recorded_at,
                is_abnormal=abnormal,
                note="血压偏高，请注意休息。" if abnormal else "状态平稳",
            )
        )

    for index, (bp, hr, abnormal) in enumerate(
        [
            ((120, 80), 70, False),
            ((115, 75), 75, False),
            ((140, 90), 78, True),
            ((122, 80), 71, False),
        ]
    ):
        recorded_at = now - timedelta(days=(28 - index * 9))
        db.add(
            HealthMetric(
                elder=elder,
                range_bucket="30d",
                systolic=bp[0],
                diastolic=bp[1],
                bpm=hr,
                recorded_at=recorded_at,
                is_abnormal=abnormal,
                note="阶段性波动" if abnormal else "状态平稳",
            )
        )

    dynamics = [
        Dynamic(
            id="dynamic-1",
            elder=elder,
            type="diet",
            title="午餐记录",
            location="B 餐厅",
            content="林奶奶今天胃口不错，午餐吃完了 90%，护理员记录了饮食偏好。",
            image_url="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop",
            happened_at=now - timedelta(hours=2),
            likes_count=12,
        ),
        Dynamic(
            id="dynamic-2",
            elder=elder,
            type="activity",
            title="晨间太极",
            location="花园区",
            content="参加了社区晨练课程，平衡训练完成得很好。",
            image_url="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
            happened_at=now - timedelta(hours=4),
            likes_count=24,
        ),
        Dynamic(
            id="dynamic-3",
            elder=elder,
            type="activity",
            title="书法练习",
            location="文化活动室",
            content="完成了一小时书法练习，情绪稳定，专注度很好。",
            image_url="https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=800&auto=format&fit=crop",
            happened_at=now - timedelta(days=1, hours=3),
            likes_count=8,
        ),
    ]
    db.add_all(dynamics)
    db.add(
        DynamicComment(
            dynamic=dynamics[0],
            author_name="张护工",
            content="今天特意加了一份软糯的南瓜。",
            time_label="12:45",
        )
    )
    db.add(DynamicLike(dynamic=dynamics[1], profile=profile))

    service_logs = {
        0: [
            ("上午 08:00", "到达并签到", "护理员已到达住所，完成体温检测。", "done", "check", None, None),
            ("上午 08:30", "早餐协助", "协助完成早餐与饮水记录。", "done", "restaurant", "https://picsum.photos/seed/food/400/250", None),
            ("上午 09:15", "生命体征检查", "血压 120/80，心率稳定。", "done", "favorite", None, "正常"),
            ("上午 10:00", "康复训练", "完成下肢拉伸与轻量阻力训练。", "pending", "fitness_center", None, "进行中"),
        ],
        1: [
            ("上午 08:10", "到达并签到", "今天准时到岗，完成签到。", "done", "check", None, None),
            ("上午 11:30", "午餐准备", "准备低盐午餐并提醒按时服药。", "pending", "restaurant", None, None),
        ],
        2: [
            ("上午 08:00", "到达并签到", "完成签到与房间巡查。", "done", "check", None, None),
            ("上午 09:15", "血压复测", "血压稳定，建议继续观察。", "done", "favorite", None, "正常"),
            ("上午 10:00", "康复训练", "进行下肢训练和步态辅助。", "pending", "fitness_center", None, "进行中"),
        ],
        3: [
            ("上午 08:30", "早餐协助", "协助完成早餐。", "done", "restaurant", None, None),
            ("中午 12:00", "午餐准备", "控制盐分摄入。", "pending", "restaurant", None, None),
        ],
        4: [
            ("上午 08:00", "到达并签到", "护理员已到岗。", "done", "check", None, None),
            ("上午 08:30", "早餐协助", "协助早餐与饮水。", "done", "restaurant", None, None),
            ("上午 09:15", "生命体征检查", "血压与心率正常。", "done", "favorite", None, "正常"),
        ],
        5: [],
        6: [
            ("上午 08:00", "到达并签到", "节假日值班已签到。", "done", "check", None, None),
            ("上午 09:30", "活动陪伴", "陪同花园散步。", "done", "self_improvement", None, None),
        ],
    }

    for day_index, entries in service_logs.items():
        for time_label, title, description, status, icon, image_url, extra in entries:
            db.add(
                ServiceLog(
                    elder=elder,
                    day_index=day_index,
                    time_label=time_label,
                    title=title,
                    description=description,
                    status=status,
                    icon=icon,
                    image_url=image_url,
                    extra=extra,
                )
            )

    orders = [
        Order(
            id="order-1",
            order_no="ORD-20260329-001",
            profile=profile,
            elder=elder,
            institution=institutions[0],
            service_name="基础生活照护",
            package_type="base",
            total_price=5000,
            status="active",
            contact_name="张女士",
            contact_phone="13800138000",
            relationship_label="女儿",
            signature_data_url="data:image/png;base64,seed-signature",
        ),
        Order(
            id="order-2",
            order_no="ORD-20260329-002",
            profile=profile,
            elder=elder,
            institution=institutions[0],
            service_name="康复进阶包",
            package_type="pro",
            total_price=1500,
            status="completed",
            contact_name="张女士",
            contact_phone="13800138000",
            relationship_label="女儿",
        ),
    ]
    db.add_all(orders)
    db.add(OrderReview(order=orders[1], rating=5, comment="康复老师很专业，进度反馈很及时。"))

    session = ChatSession(id="session-1", profile=profile, title="首页咨询")
    db.add(session)
    db.flush()
    db.add_all(
        [
            ChatMessage(session=session, role="assistant", content="你好，我是松小暖。想了解机构、健康数据还是服务进度？"),
            ChatMessage(session=session, role="user", content="先介绍一下这个 App 能做什么。"),
        ]
    )

    db.commit()
