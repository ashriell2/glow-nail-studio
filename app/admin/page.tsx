"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
// İkonlar eksikse hata vermemesi için basitleştirdik, varsa ekle
import { Users, Calendar, DollarSign, Ban, Clock } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  // BAŞLANGIÇTA SAYFAYI GİZLE (loading = true)
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Admin mi değil mi?
  
  const [stats, setStats] = useState({ totalApp: 0, totalRevenue: 0 });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("09:00");
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  useEffect(() => {
    const checkUserAndFetch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // 1. GÜVENLİK KONTROLÜ (PARANOYAK MOD) 🛡️
        if (!user || user.user_metadata?.role !== 'admin') {
           // Admin değilse anında kov
           router.replace("/"); // push yerine replace kullanıyoruz ki "Geri" tuşuyla dönemesin
           return;
        }

        // Buraya geldiyse Admindir
        setIsAdmin(true);

        // 2. VERİLERİ ÇEK
        const { data: appData } = await supabase
          .from("appointments")
          .select(`*, profiles(full_name, phone), services(name, price)`)
          .order("start_time", { ascending: false });

        if (appData) {
          setAppointments(appData);
          const validApps = appData.filter(app => app.status !== 'blocked');
          const revenue = validApps.reduce((acc, curr) => acc + (curr.services?.price || 0), 0);
          setStats({ totalApp: validApps.length, totalRevenue: revenue });
        }

        const { data: serviceData } = await supabase.from("services").select("*").order("id");
        if (serviceData) setServices(serviceData);

      } catch (e) {
        console.error("Admin hatası:", e);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetch();
  }, [router]);

  // --- İŞLEM FONKSİYONLARI ---
  const updatePrice = async (id: number, newPrice: string) => {
    const price = parseInt(newPrice);
    if (isNaN(price)) return;
    const { error } = await supabase.from("services").update({ price }).eq("id", id);
    if (!error) alert("Fiyat güncellendi! ✅");
  };

  const handleBlockSlot = async () => {
    if (!blockDate || !blockTime) return alert("Tarih/Saat seçin");
    const blockedService = services.find(s => s.name.includes("KAPALI"));
    if (!blockedService) return alert("'KAPALI' servisi bulunamadı");
    
    if(!confirm("Kapatmak istiyor musunuz?")) return;

    const [h, m] = blockTime.split(':');
    const start = new Date(blockDate);
    start.setHours(parseInt(h), parseInt(m), 0, 0);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 60);

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("appointments").insert({
        customer_id: user?.id, service_id: blockedService.id,
        start_time: start.toISOString(), end_time: end.toISOString(), status: 'blocked'
    });
    alert("Kapandı!");
    window.location.reload();
  };

  const handleBlockDay = async () => {
    if (!blockDate) return alert("Tarih seçin");
    const blockedService = services.find(s => s.name.includes("KAPALI"));
    if(!confirm("TÜM GÜNÜ kapatmak emin misiniz?")) return;

    const { data: { user } } = await supabase.auth.getUser();
    const inserts = timeSlots.map(time => {
        const [h, m] = time.split(':');
        const start = new Date(blockDate);
        start.setHours(parseInt(h), parseInt(m), 0, 0);
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + 60);
        return { customer_id: user?.id, service_id: blockedService.id, start_time: start.toISOString(), end_time: end.toISOString(), status: 'blocked' };
    });
    await supabase.from("appointments").insert(inserts);
    alert("Gün Kapandı!");
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Silinsin mi?")) return;
      await supabase.from("appointments").delete().eq("id", id);
      setAppointments(appointments.filter(a => a.id !== id));
  };

  // EĞER ADMİN DEĞİLSE VEYA YÜKLENİYORSA SİYAH EKRAN GÖSTER
  if (loading || !isAdmin) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
                <h2 className="text-xl font-bold">Güvenlik Kontrolü...</h2>
                <p className="text-gray-400 text-sm">Yetkileriniz sorgulanıyor.</p>
            </div>
        </div>
    );
  }

  // --- ADMIN İÇERİĞİ (Sadece isAdmin=true ise görünür) ---
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Yönetici Paneli</h1>

        {/* İSTATİSTİKLER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-500 text-sm">Toplam Randevu</div>
                <div className="text-3xl font-bold">{stats.totalApp}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-500 text-sm">Tahmini Ciro</div>
                <div className="text-3xl font-bold text-green-600">{stats.totalRevenue} ₺</div>
            </div>
        </div>

        {/* ORTA BÖLÜM: KAPATMA & LİSTE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* KAPATMA KUTUSU */}
             <div className="bg-red-50 p-6 rounded-xl border border-red-100 h-fit">
                <h3 className="font-bold text-red-800 flex items-center gap-2 mb-4"><Ban className="w-5 h-5"/> Müsaitliği Kapat</h3>
                <input type="date" className="w-full p-2 mb-2 rounded border" onChange={e=>setBlockDate(e.target.value)} />
                <select className="w-full p-2 mb-4 rounded border" onChange={e=>setBlockTime(e.target.value)}>
                    {timeSlots.map(t=><option key={t}>{t}</option>)}
                </select>
                <div className="flex gap-2">
                    <button onClick={handleBlockSlot} className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded text-xs font-bold hover:bg-red-100">SAATİ KAPAT</button>
                    <button onClick={handleBlockDay} className="flex-1 bg-red-600 text-white py-2 rounded text-xs font-bold hover:bg-red-700">TÜM GÜN</button>
                </div>
             </div>

             {/* RANDEVU LİSTESİ */}
             <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 max-h-[500px] overflow-y-auto">
                <h3 className="font-bold mb-4">Randevular</h3>
                {appointments.map(app => (
                    <div key={app.id} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50">
                        <div>
                            <div className="font-bold text-gray-800">
                                {app.status==='blocked' ? '⛔ ENGEL' : app.profiles?.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                                {new Date(app.start_time).toLocaleString('tr-TR')} • {app.services?.name}
                            </div>
                        </div>
                        <button onClick={()=>handleDelete(app.id)} className="text-red-500 text-xs hover:underline">Sil</button>
                    </div>
                ))}
             </div>
        </div>

        {/* FİYATLAR */}
        <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-bold mb-4">Fiyatları Düzenle</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {services.filter(s=>!s.name.includes("KAPALI")).map(s => (
                    <div key={s.id}>
                        <label className="text-xs text-gray-500 block mb-1">{s.name}</label>
                        <div className="flex items-center gap-1">
                            <input type="number" defaultValue={s.price} className="w-full p-2 border rounded" onBlur={e=>updatePrice(s.id, e.target.value)}/>
                            <span className="text-gray-400">₺</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </main>
  );
}