import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreditCard, ImagePlus, Bell, ShieldCheck, Save, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";
import { getPaymentSettings, adminUpdatePaymentSettings, clearPaymentSettingsError, clearPaymentSettingsSuccess } from "../../store/order/paymentSettingsSlice";
import { AdminPageHeader, AdminCard } from "@/components/admin/AdminUI";
import Loader from "../../extras/Loader";

const MAX_QR_SIZE = 5 * 1024 * 1024;

export default function AdminPaymentSettings() {
  const dispatch = useDispatch();
  const { settings, loading, error, success } = useSelector((state) => state.paymentSettings);
  const [upiId, setUpiId] = useState("");
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState("");
  const [notifyAdmins, setNotifyAdmins] = useState(true);
  const [notifyTickets, setNotifyTickets] = useState(true);
  const [formError, setFormError] = useState("");

  useEffect(() => { dispatch(getPaymentSettings()); }, [dispatch]);
  useEffect(() => { if (settings) { setUpiId(settings.upiId || ""); setNotifyAdmins(settings.notifyAdminsOnNewOrder !== false); setNotifyTickets(settings.notifyAdminsOnNewTicket !== false); } }, [settings]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearPaymentSettingsError()); } }, [error, dispatch]);
  useEffect(() => { if (success) { toast.success("Payment settings saved"); dispatch(clearPaymentSettingsSuccess()); setQrFile(null); if (qrPreview) URL.revokeObjectURL(qrPreview); setQrPreview(""); } }, [success, dispatch]);
  useEffect(() => () => { if (qrPreview) URL.revokeObjectURL(qrPreview); }, [qrPreview]);

  const handleQr = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setFormError("Please select a valid image file.");
    if (file.size > MAX_QR_SIZE) return setFormError("QR image must be 5 MB or smaller.");
    if (qrPreview) URL.revokeObjectURL(qrPreview);
    setFormError(""); setQrFile(file); setQrPreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    const value = upiId.trim();
    if (value && !/^[\w.-]+@[\w.-]+$/.test(value)) return setFormError("Enter a valid UPI ID such as name@bank.");
    setFormError("");
    const fd = new FormData();
    fd.append("upiId", value);
    fd.append("notifyAdminsOnNewOrder", String(notifyAdmins));
    fd.append("notifyAdminsOnNewTicket", String(notifyTickets));
    if (qrFile) fd.append("qrImage", qrFile);
    dispatch(adminUpdatePaymentSettings(fd));
  };

  if (loading && !settings) return <Loader />;

  return <div className="min-h-screen bg-[var(--surface-1)] p-3 sm:p-5 lg:p-7"><div className="max-w-5xl mx-auto space-y-5">
    <AdminPageHeader title="Payment Settings" subtitle="Configure customer payment instructions and admin notifications." icon={<CreditCard className="w-6 h-6"/>} badge="Secure" />
    {formError && <div className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 px-4 py-3 text-sm font-semibold">{formError}</div>}
    <div className="grid lg:grid-cols-[1fr_320px] gap-5">
      <AdminCard title="UPI payment configuration" subtitle="These details are shown to customers when online payment is selected.">
        <div className="space-y-5">
          <div><label className="field-label">UPI ID</label><input value={upiId} onChange={(e)=>{setUpiId(e.target.value);setFormError("")}} placeholder="samridhi@upi" className="field-input"/><p className="text-[10px] text-[var(--text-muted)] mt-1.5">Leave blank if online UPI payment is not being offered.</p></div>
          <div><label className="field-label">UPI QR Code</label><div className="grid sm:grid-cols-[180px_1fr] gap-5 items-start"><div className="w-44 h-44 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] grid place-items-center overflow-hidden">{qrPreview?<img src={qrPreview} alt="New UPI QR preview" className="w-full h-full object-contain p-2"/>:settings?.qrImage?.url?<img src={settings.qrImage.url} alt="Current UPI QR" className="w-full h-full object-contain p-2"/>:<ImagePlus className="w-8 h-8 text-[var(--text-muted)]"/>}</div><div><label className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-0)] px-4 py-2.5 text-sm font-bold cursor-pointer hover:border-blue-500"><UploadCloud className="w-4 h-4 text-blue-600"/>Choose QR image<input type="file" accept="image/*" onChange={handleQr} className="sr-only"/></label><p className="text-xs text-[var(--text-muted)] mt-2">PNG/JPG/WebP recommended. Maximum 5 MB.</p>{qrFile&&<p className="text-xs font-semibold text-blue-600 mt-2 truncate">Selected: {qrFile.name}</p>}</div></div></div>
        </div>
      </AdminCard>
      <AdminCard title="Security" subtitle="Payment configuration is restricted to administrators."><div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4"><ShieldCheck className="w-5 h-5 text-emerald-600 mb-2"/><p className="text-sm font-bold">Protected settings</p><p className="text-xs text-[var(--text-muted)] mt-1 leading-5">Only authorized admin users should be able to update payment instructions and QR assets.</p></div><div className="mt-3 rounded-xl bg-[var(--surface-2)] p-4"><p className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-muted)]">Current QR</p><p className="text-sm font-bold mt-1">{settings?.qrImage?.url?"Configured":"Not configured"}</p></div></AdminCard>
    </div>
    <AdminCard title="Admin notifications" subtitle="Control operational email notifications."><div className="space-y-3">{[["New orders","Notify admins when customers place new orders.",notifyAdmins,setNotifyAdmins],["New support tickets","Notify admins when customers create support tickets.",notifyTickets,setNotifyTickets]].map(([title,text,value,setValue])=><div key={title} className="rounded-xl border border-[var(--line)] bg-[var(--surface-0)] p-4 flex items-center justify-between gap-4"><div className="flex gap-3"><span className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 grid place-items-center shrink-0"><Bell className="w-4 h-4"/></span><div><p className="text-sm font-bold">{title}</p><p className="text-xs text-[var(--text-muted)] mt-1">{text}</p></div></div><button type="button" role="switch" aria-checked={value} onClick={()=>setValue(v=>!v)} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ${value?"bg-blue-600":"bg-[var(--line)]"}`}><span className={`h-5 w-5 rounded-full bg-white shadow transform ${value?"translate-x-5":"translate-x-1"}`}/></button></div>)}</div></AdminCard>
    <div className="flex justify-end"><button onClick={handleSave} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm font-bold disabled:opacity-50"><Save className="w-4 h-4"/>{loading?"Saving…":"Save payment settings"}</button></div>
  </div></div>;
}
