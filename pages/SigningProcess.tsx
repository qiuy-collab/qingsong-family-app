import React, { useRef, useState } from 'react';
import { appDataService } from '../services/appDataService';

interface SigningProcessProps {
  institutionId?: string | null;
  onBack: () => void;
  onComplete: () => void;
  onShowToast: (msg: string) => void;
}

const stepTitles = ['入住人信息', '订单配置', '在线签署'] as const;

const SigningProcess: React.FC<SigningProcessProps> = ({ institutionId, onBack, onComplete, onShowToast }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    phone: '',
    relationship: '子女',
    photo: null as string | null,
  });
  const [isProPackage, setIsProPackage] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const basePrice = 5000;
  const proPrice = 1500;
  const totalPrice = isProPackage ? basePrice + proPrice : basePrice;

  const handleInputChange = (field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((current) => ({ ...current, photo: reader.result as string }));
      onShowToast('照片上传成功');
    };
    reader.readAsDataURL(file);
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in event ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    const y = 'touches' in event ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in event ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    const y = 'touches' in event ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

    context.lineTo(x, y);
    context.strokeStyle = '#000';
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.stroke();
    if ('touches' in event) event.preventDefault();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSignatureData(canvas.toDataURL());
    setShowSignatureModal(false);
    onShowToast('签名已保存');
  };

  const submitOrder = async () => {
    if (!signatureData) {
      onShowToast('请先完成手写签名');
      return;
    }

    try {
      setSubmitting(true);
      await appDataService.signOrder({
        institution_id: institutionId ?? 'inst-1',
        elder_id: 'e1234567-e89b-12d3-a456-426614174000',
        name: formData.name,
        id_number: formData.idNumber,
        phone: formData.phone,
        relationship: formData.relationship,
        is_pro_package: isProPackage,
        photo: formData.photo,
        signature_data: signatureData,
      });
      onComplete();
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : '签约提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.photo) return onShowToast('请上传入住人档案照片');
      if (!formData.name.trim()) return onShowToast('请填写入住人姓名');
      if (!formData.idNumber.trim() || formData.idNumber.length < 15) return onShowToast('请填写正确的身份证号');
      if (!formData.phone.trim() || formData.phone.length < 11) return onShowToast('请填写正确的联系电话');
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    await submitOrder();
  };

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
      <div className="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold">上传档案照片</h3>
        <div className="flex items-center gap-6">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
              formData.photo ? 'border-primary' : 'border-slate-200 bg-slate-50 active:bg-slate-100'
            }`}
          >
            {formData.photo ? (
              <img src={formData.photo} className="h-full w-full object-cover" alt="Preview" />
            ) : (
              <>
                <span className="material-symbols-outlined text-slate-400">photo_library</span>
                <span className="text-[10px] text-slate-400">选择照片</span>
              </>
            )}
          </div>
          <p className="flex-1 text-xs leading-relaxed text-slate-400">
            上传近期清晰照片，便于护理档案建立与身份核验。<span className="font-bold text-red-500"> *必填</span>
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label className="flex items-center justify-between px-1 text-sm font-medium text-slate-900">
            入住人姓名 <span className="text-[10px] font-bold text-red-500">必填</span>
          </label>
          <input
            type="text"
            placeholder="请输入真实姓名"
            value={formData.name}
            onChange={(event) => handleInputChange('name', event.target.value)}
            className="h-12 w-full rounded-xl border-slate-100 bg-slate-50/50 px-4 focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center justify-between px-1 text-sm font-medium text-slate-900">
            身份证号码 <span className="text-[10px] font-bold text-red-500">必填</span>
          </label>
          <input
            type="text"
            placeholder="18 位身份证号码"
            value={formData.idNumber}
            onChange={(event) => handleInputChange('idNumber', event.target.value)}
            className="h-12 w-full rounded-xl border-slate-100 bg-slate-50/50 px-4 focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center justify-between px-1 text-sm font-medium text-slate-900">
            紧急联系人电话 <span className="text-[10px] font-bold text-red-500">必填</span>
          </label>
          <input
            type="tel"
            placeholder="联系人手机号"
            value={formData.phone}
            onChange={(event) => handleInputChange('phone', event.target.value)}
            className="h-12 w-full rounded-xl border-slate-100 bg-slate-50/50 px-4 focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="px-1 text-sm font-medium text-slate-900">与入住人关系</label>
          <div className="flex gap-2">
            {['子女', '配偶', '本人', '其他'].map((relationship) => (
              <button
                key={relationship}
                onClick={() => setFormData((current) => ({ ...current, relationship }))}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                  formData.relationship === relationship
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-slate-100 bg-slate-50 text-slate-500 active:bg-slate-100'
                }`}
              >
                {relationship}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
      <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold">定制服务配置</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border-2 border-primary bg-blue-50/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <span className="material-symbols-outlined">home</span>
              </div>
              <div>
                <p className="text-sm font-bold">
                  基础生活照护 <span className="rounded bg-slate-100 px-1 text-[10px] text-slate-400">必选</span>
                </p>
                <p className="text-[10px] text-slate-400">包含日常照料、餐食协助和健康监测。</p>
                <p className="mt-0.5 text-sm font-bold text-primary">
                  {basePrice} 元<span className="text-[10px] font-normal text-slate-400">/月</span>
                </p>
              </div>
            </div>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
              <span className="material-symbols-outlined text-xs font-bold">check</span>
            </div>
          </div>

          <div
            onClick={() => setIsProPackage((current) => !current)}
            className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
              isProPackage ? 'border-primary bg-blue-50/30 shadow-sm' : 'border-slate-100 bg-slate-50/30 active:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                  isProPackage ? 'border-primary bg-primary text-white' : 'border-slate-100 bg-white text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined">fitness_center</span>
              </div>
              <div>
                <p className="text-sm font-bold">康复进阶包</p>
                <p className="text-[10px] text-slate-400">每日康复训练、进度反馈和专项指导。</p>
                <p className={`mt-0.5 text-sm font-bold ${isProPackage ? 'text-primary' : 'text-slate-900'}`}>
                  {proPrice} 元<span className="text-[10px] font-normal text-slate-400">/月</span>
                </p>
              </div>
            </div>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                isProPackage ? 'border-primary bg-primary text-white' : 'border-slate-200'
              }`}
            >
              {isProPackage && <span className="material-symbols-outlined text-xs font-bold">check</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold">费用明细</h3>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-500">基础生活照护</span>
          <span className="font-bold">{basePrice} 元</span>
        </div>
        {isProPackage && (
          <div className="animate-in fade-in mb-2 flex justify-between text-sm duration-300">
            <span className="text-slate-500">康复进阶包</span>
            <span className="font-bold">{proPrice} 元</span>
          </div>
        )}
        <div className="my-4 border-t border-dashed border-slate-100" />
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold">月度预估总计</span>
          <span className="scale-110 text-2xl font-black text-primary">{totalPrice} 元</span>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
      <div className="flex flex-col items-center rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-primary">
          <span className="material-symbols-outlined text-3xl">contract_edit</span>
        </div>
        <h3 className="mb-2 text-xl font-bold">电子合同签署</h3>
        <p className="mb-6 text-sm text-slate-400">请确认以下签约信息，并完成手写签名。</p>

        <div className="mb-6 w-full space-y-3 rounded-2xl bg-slate-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">入住机构</span>
            <span className="font-medium">阳光花园养老生活馆</span>
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
          className={`mb-4 flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
            signatureData ? 'border-primary bg-blue-50 text-primary' : 'border-slate-100 bg-white text-slate-300 active:bg-slate-50'
          }`}
        >
          {signatureData ? (
            <div className="relative flex h-full w-full items-center justify-center">
              <img src={signatureData} className="max-h-full max-w-full object-contain" alt="Signature" />
              <div className="absolute right-2 top-2 rounded-full bg-white/80 p-1">
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
          签署即代表您已阅读并同意 <span className="cursor-pointer font-medium text-primary">《入住服务协议》</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4">
        <button onClick={step === 1 ? onBack : () => setStep((current) => current - 1)} className="p-2 -ml-2 transition-transform active:scale-90">
          <span className="material-symbols-outlined text-xl">chevron_left</span>
        </button>
        <h1 className="text-lg font-bold">{stepTitles[step - 1]}</h1>
        <div className="w-8" />
      </header>

      <div className="px-6 py-8">
        <div className="relative mb-8 flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 -z-10 h-0.5 -translate-y-1/2 bg-slate-200" />
          <div className="absolute left-0 top-1/2 -z-10 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }} />
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  step >= index ? 'scale-110 bg-primary text-white shadow-sm' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {step > index ? <span className="material-symbols-outlined text-xs font-bold">check</span> : index}
              </div>
              <span className={`text-[10px] font-medium ${step >= index ? 'font-bold text-primary' : 'text-slate-400'}`}>
                {['基本信息', '定制服务', '确认签署'][index - 1]}
              </span>
            </div>
          ))}
        </div>

        {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
      </div>

      <footer className="mt-auto flex gap-3 border-t border-slate-50 bg-white p-6">
        {step > 1 && (
          <button
            onClick={() => setStep((current) => current - 1)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-colors active:bg-slate-50"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <button
          onClick={() => void handleNext()}
          disabled={submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-95 active:shadow-none disabled:bg-slate-300 disabled:shadow-none"
        >
          <span>{step === 3 ? (submitting ? '提交中…' : '确认支付并签署') : '确认并下一步'}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </footer>

      {showSignatureModal && (
        <div className="animate-in fade-in zoom-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm duration-200">
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h4 className="text-lg font-bold">电子手写签名</h4>
                <p className="text-[10px] text-slate-400">请在下方白色区域内完成您的手写签名。</p>
              </div>
              <button onClick={() => setShowSignatureModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 active:scale-90">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4">
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
                className="w-full touch-none cursor-crosshair rounded-2xl border-2 border-slate-200 bg-white shadow-inner"
              />
            </div>

            <div className="flex gap-3 p-6">
              <button
                onClick={clearCanvas}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 font-bold text-slate-500 transition-colors active:bg-slate-50"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                清除重写
              </button>
              <button
                onClick={saveSignature}
                className="flex flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
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
