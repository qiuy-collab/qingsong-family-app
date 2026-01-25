
-- 1. 表结构设计

-- 用户扩展表 (与 Supabase Auth 关联)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT UNIQUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 老人信息表
CREATE TABLE elders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    avatar_url TEXT,
    room_number TEXT,
    -- 健康阈值设置（用于后端预警）
    hr_min INTEGER DEFAULT 60,
    hr_max INTEGER DEFAULT 100,
    bp_sys_max INTEGER DEFAULT 140, -- 收缩压上限
    bp_dia_max INTEGER DEFAULT 90,  -- 舒张压上限
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 家庭组/权限关联表
CREATE TYPE user_role AS ENUM ('admin', 'viewer');
CREATE TABLE family_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    elder_id UUID REFERENCES elders(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role DEFAULT 'viewer',
    invite_code TEXT, -- 邀请码逻辑
    UNIQUE(elder_id, profile_id)
);

-- 机构信息表
CREATE TABLE institutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    rating DECIMAL(3,2),
    reviews_count INTEGER DEFAULT 0,
    base_price DECIMAL(10,2),
    total_beds INTEGER,
    available_beds INTEGER,
    distance_desc TEXT,
    tags TEXT[],
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 健康数据表 (时序数据)
CREATE TABLE health_metrics (
    id BIGSERIAL PRIMARY KEY,
    elder_id UUID REFERENCES elders(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'HR' (心率), 'BP' (血压)
    value_json JSONB NOT NULL, -- e.g., {"systolic": 145, "diastolic": 95} 或 {"bpm": 72}
    is_abnormal BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_health_metrics_elder_time ON health_metrics (elder_id, recorded_at DESC);

-- 服务订单表
CREATE TYPE order_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_no TEXT UNIQUE NOT NULL,
    profile_id UUID REFERENCES profiles(id),
    elder_id UUID REFERENCES elders(id),
    institution_id UUID REFERENCES institutions(id),
    service_name TEXT,
    total_price DECIMAL(10,2),
    status order_status DEFAULT 'pending',
    signature_url TEXT, -- 电子签名路径
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 行级安全策略 (RLS)

ALTER TABLE elders ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

-- 策略：只有家庭组成员可以查看老人的健康数据
CREATE POLICY "Family members can view elder metrics" ON health_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM family_groups 
            WHERE family_groups.elder_id = health_metrics.elder_id 
            AND family_groups.profile_id = auth.uid()
        )
    );

-- 策略：只有管理员可以修改老人信息
CREATE POLICY "Admins can update elder info" ON elders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM family_groups 
            WHERE family_groups.elder_id = elders.id 
            AND family_groups.profile_id = auth.uid()
            AND family_groups.role = 'admin'
        )
    );

-- 3. 实时预警触发器

-- 启用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE health_metrics;

-- 自动判定异常触发器函数
CREATE OR REPLACE FUNCTION check_health_abnormality()
RETURNS TRIGGER AS $$
DECLARE
    v_hr_max INTEGER;
    v_bp_sys_max INTEGER;
BEGIN
    SELECT hr_max, bp_sys_max INTO v_hr_max, v_bp_sys_max FROM elders WHERE id = NEW.elder_id;
    
    IF NEW.metric_type = 'HR' AND (NEW.value_json->>'bpm')::int > v_hr_max THEN
        NEW.is_abnormal := TRUE;
    ELSIF NEW.metric_type = 'BP' AND (NEW.value_json->>'systolic')::int > v_bp_sys_max THEN
        NEW.is_abnormal := TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_health BEFORE INSERT ON health_metrics
    FOR EACH ROW EXECUTE FUNCTION check_health_abnormality();

-- 4. 模拟测试数据

-- 插入一个机构
INSERT INTO institutions (name, rating, base_price, total_beds, available_beds, tags, image_url)
VALUES ('阳光花园养老生活', 4.9, 5200, 200, 3, ARRAY['专业护理', '康复', '医疗保险'], 'https://picsum.photos/seed/org1/800/600');

-- 插入一个老人
INSERT INTO elders (id, name, age, avatar_url, hr_max, bp_sys_max)
VALUES ('e1234567-e89b-12d3-a456-426614174000', '张爷爷', 82, 'https://picsum.photos/seed/grandpa/200/200', 100, 140);

-- 插入一条异常血压数据（前端会显示红字/预警）
INSERT INTO health_metrics (elder_id, metric_type, value_json, is_abnormal)
VALUES ('e1234567-e89b-12d3-a456-426614174000', 'BP', '{"systolic": 145, "diastolic": 95}', TRUE);
