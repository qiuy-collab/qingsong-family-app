
import React, { useState, useRef, useEffect } from 'react';

interface SigningProcessProps {
  onBack: () => void;
  onComplete: () => void;
  onShowToast: (msg: string) => void;
}

const SigningProcess: React.FC<SigningProcessProps> = ({ onBack, onComplete, onShowToast }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    phone: '',
    relationship: '子女',
    photo: null as string | null
  });
  const [isProPackage, setIsProPackage] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const basePrice = 5000;
  const proPrice = 1500;
  const totalPrice = isProPackage ? basePrice + proPrice : basePrice;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
        onShowToast('照片上传成功');
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Prevent scrolling when drawing on touch devices
    if ('touches' in e) e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Check if canvas is empty (optional but good)
    const dataURL = canvas.toDataURL();
    setSignatureData(dataURL);
    setShowSignatureModal(false);
    onShowToast('签名已捕获');
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white p-6 rounded-3xl shadow-sm space-y-6">
        <h3 className="font-bold text-lg">上传档案照片</h3>
        <div className="flex items-center gap-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all overflow-hidden ${formData.photo ? 'border-primary' : 'bg-slate-50 border-slate-200 active:bg-slate-100'}`}
          >
            {formData.photo ? (
              <img src={formData.photo} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <>
                <span className="material-symbols-outlined text-slate-400">photo_library</span>
                <span className="text-[10px] text-slate-400">选择照片</span>
              </>
            )}
          </div>
          <p className="flex-1 text-xs text-slate-400 leading-relaxed">
            点击左侧上传老人近照。系统将<span className="text-primary font-medium">自动处理</span>背景和光照，生成符合标准的档案照。<span className="text-red-500 font-bold">*必填</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900 px-1 flex items-center justify-between">
            入住人姓名 <span className="text-[10px] text-red-500 font-bold">必填</span>
          </label>
          <input 
            type="text" 
            placeholder="请输入真实姓名" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 focus:ring-primary focus:border-primary" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900 px-1 flex items-center justify-between">
            身份证号码 <span className="text-[10px] text-red-500 font-bold">必填</span>
          </label>
          <input 
            type="text" 
            placeholder="18位身份证号" 
            value={formData.idNumber}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            className="w-full h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 focus:ring-primary focus:border-primary" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900 px-1 flex items-center justify-between">
            紧急联系人电话 <span className="text-[10px] text-red-500 font-bold">必填</span>
          </label>
          <input 
            type="tel" 
            placeholder="联系人手机号码" 
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 focus:ring-primary focus:border-primary" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900 px-1">与入住人关系</label>
          <div className="flex gap-2">
            {['子女', '配偶', '本人', '其他'].map(r => (
              <button 
                key={r} 
                onClick={() => setFormData(prev => ({ ...prev, relationship: r }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${formData.relationship === r ? 'bg-primary border-primary text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500 active:bg-slate-100'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
        <h3 className="font-bold text-lg">定制服务配置</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-2xl border-2 border-primary bg-blue-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined">home</span>
              </div>
              <div>
                <p className="font-bold text-sm">基础生活照护 <span className="text-[10px] px-1 bg-slate-100 text-slate-400 rounded">必选</span></p>
                <p className="text-[10px] text-slate-400">包含每日膳食、房间清洁及监测</p>
                <p className="text-primary font-bold text-sm mt-0.5">¥5000<span className="text-[10px] font-normal text-slate-400">/月</span></p>
              </div>
            </div>
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xs font-bold">check</span>
            </div>
          </div>
          
          <div 
            onClick={() => setIsProPackage(!isProPackage)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isProPackage ? 'border-primary bg-blue-50/30 shadow-sm' : 'border-slate-100 bg-slate-50/30 active:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-colors ${isProPackage ? 'bg-primary text-white border-primary' : 'bg-white border-slate-100 text-slate-400'}`}>
                <span className="material-symbols-outlined">fitness_center</span>
              </div>
              <div>
                <p className="font-bold text-sm">康复进阶包</p>
                <p className="text-[10px] text-slate-400">专业物理治疗师提供每日康复训练指导</p>
                <p className={`font-bold text-sm mt-0.5 transition-colors ${isProPackage ? 'text-primary' : 'text-slate-900'}`}>¥1500<span className="text-[10px] font-normal text-slate-400">/月</span></p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${isProPackage ? 'bg-primary border-primary text-white' : 'border-slate-200'}`}>
              {isProPackage && <span className="material-symbols-outlined text-xs font-bold">check</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm">
        <h3 className="font-bold text-lg mb-4">费用明细</h3>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">基础生活照护</span>
          <span className="font-bold">¥5000</span>
        </div>
        {isProPackage && (
          <div className="flex justify-between text-sm mb-2 animate-in fade-in duration-300">
            <span className="text-slate-500">康复进阶包</span>
            <span className="font-bold">¥1500</span>
          </div>
        )}
        <div className="border-t border-dashed border-slate-100 my-4"></div>
        <div className="flex justify-between items-baseline">
          <span className="text-lg font-bold">月度预计总计</span>
          <span className="text-2xl font-black text-primary transition-all scale-110">¥{totalPrice}</span>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-4">
          <span className="material-symbols-outlined text-3xl">contract_edit</span>
        </div>
        <h3 className="font-bold text-xl mb-2">电子合同签署</h3>
        <p className="text-sm text-slate-400 mb-6">请仔细核对以下签约信息</p>
        
        <div className="w-full bg-slate-50 rounded-2xl p-4 space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">入住机构</span>
            <span className="font-medium">阳光花园养老生活</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">入住人</span>
            <span className="font-medium">{formData.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">联系电话</span>
            <span className="font-medium">{formData.phone}</span>
          </div>
        </div>

        <div 
          onClick={() => setShowSignatureModal(true)}
          className={`w-full h-48 rounded-2xl flex flex-col items-center justify-center gap-2 mb-4 border-2 border-dashed transition-all cursor-pointer overflow-hidden ${signatureData ? 'bg-blue-50 border-primary text-primary' : 'bg-white border-slate-100 text-slate-300 active:bg-slate-50'}`}
        >
          {signatureData ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={signatureData} className="max-w-full max-h-full object-contain" alt="Signature" />
              <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
                <span className="material-symbols-outlined text-sm">edit</span>
              </div>
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined text-4xl">draw</span>
              <p className="text-xs">点击此处进行手写签名</p>
            </>
          )}
        </div>

        <p className="text-[10px] text-slate-400">
          签署即代表您已阅读并同意 <span className="text-primary font-medium cursor-pointer" onClick={() => onShowToast('正在查看《入住服务协议》')}>《入住服务协议》</span>
        </p>
      </div>
    </div>
  );

  const titles = ['入住人信息', '订单配置', '在线签署'];

  const handleNext = () => {
    if (step === 1) {
      if (!formData.photo) {
        onShowToast('请上传入住人档案照片');
        return;
      }
      if (!formData.name.trim()) {
        onShowToast('请填写入住人姓名');
        return;
      }
      if (!formData.idNumber.trim() || formData.idNumber.length < 15) {
        onShowToast('请填写正确的身份证号码');
        return;
      }
      if (!formData.phone.trim() || formData.phone.length < 11) {
        onShowToast('请填写正确的紧急联系电话');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      if (!signatureData) {
        onShowToast('请先完成手写签名');
        return;
      }
      onComplete();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      <header className="sticky top-0 z-50 bg-white px-4 py-4 flex items-center justify-between border-b border-slate-100">
        <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="p-2 -ml-2 active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-xl">chevron_left</span>
        </button>
        <h1 className="text-lg font-bold">{titles[step - 1]}</h1>
        <div className="w-8"></div>
      </header>

      <div className="px-6 py-8">
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 -z-10"></div>
          <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${step >= i ? 'bg-primary text-white scale-110 shadow-sm' : 'bg-slate-200 text-slate-400'}`}>
                {step > i ? <span className="material-symbols-outlined text-xs font-bold">check</span> : i}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${step >= i ? 'text-primary font-bold' : 'text-slate-400'}`}>
                {['基本信息', '定制服务', '确认签署'][i - 1]}
              </span>
            </div>
          ))}
        </div>

        {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
      </div>

      <footer className="mt-auto p-6 flex gap-3 bg-white border-t border-slate-50">
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm active:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <button 
          onClick={handleNext}
          className="flex-1 h-14 bg-primary text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 active:shadow-none transition-all"
        >
          <span>{step === 3 ? '确认支付并签署' : '确认并下一步'}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </footer>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg">电子手写签名</h4>
                <p className="text-[10px] text-slate-400">请在下方白色区域内完成您的手写签名</p>
              </div>
              <button 
                onClick={() => setShowSignatureModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 active:scale-90"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            
            <div className="p-4 bg-slate-50">
              <canvas 
                ref={canvasRef}
                width={340}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full bg-white rounded-2xl border-2 border-slate-200 shadow-inner cursor-crosshair touch-none"
              />
            </div>

            <div className="p-6 flex gap-3">
              <button 
                onClick={clearCanvas}
                className="flex-1 py-3 border border-slate-200 text-slate-500 font-bold rounded-2xl active:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                清除重写
              </button>
              <button 
                onClick={saveSignature}
                className="flex-[1.5] py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                确认签名
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SigningProcess;
