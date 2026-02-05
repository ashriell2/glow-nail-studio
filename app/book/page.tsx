"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { Users, Calendar, DollarSign, Ban, Clock } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalApp: 0, totalRevenue: 0 });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  // Bloklama için gerekli state'ler
  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("09:00");
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      // 1. Yetki Kontrolü
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }

      // 2. Randevuları Çek
      const { data: appData } = await supabase
        .from("appointments")
        .select(`*, profiles(full_name, phone), services(name, price)`)
        .order("start_time", { ascending: false });

      if (appData) {
        setAppointments(appData);
        // İstatistik (Sadece 'pending' ve onaylıları say, 'blocked' olanları ciroya katma)
        const validApps = appData.filter(app => app.status !== 'blocked');
        const revenue = validApps.reduce((acc, curr) => acc + (curr.services?.price || 0), 0);
        setStats({ totalApp: validApps.length, totalRevenue: revenue });
      }

      // 3. Hizmetleri Çek
      const { data: serviceData } = await supabase.from("services").select("*").order("id");
      if (serviceData) setServices(serviceData);

      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [router]);

  // --- HİZMET FİYATI GÜNCELLEME ---
  const updatePrice = async (id: number, newPrice: string) => {
    const price = parseInt(newPrice);
    if (isNaN(price)) return;
    const { error } = await supabase.from("services").update({ price }).eq("id", id);
    if (!error) alert("Fiyat güncellendi! ✅");
  };

  // --- TEK BİR SAATİ KAPATMA ---
  const handleBlockSlot = async () => {
    if (!blockDate || !blockTime) { alert("Lütfen tarih ve saat seçin."); return; }
    
    // "KAPALI" hizmetini bul (Adında 'KAPALI' geçen servisi arıyoruz)
    const blockedService = services.find(s => s.name.includes("KAPALI"));
    if (!blockedService) { alert("'KAPALI' isimli servis veritabanında bulunamadı."); return; }

    const confirmMsg = `${blockDate} tarihli ${blockTime} saatini kapatmak istiyor musunuz?`;
    if (!confirm(confirmMsg)) return;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Tarih formatla
        const [hours, minutes] = blockTime.split(':');
        const startTime = new Date(blockDate);
        startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + 60);

        const { error } = await supabase.from("appointments").insert({
            customer_id: user?.id,
            service_id: blockedService.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: 'blocked' // Özel durum: Engellendi
        });

        if (error) throw error;
        alert("Saat başarıyla kapatıldı! ⛔");
        window.location.reload(); // Sayfayı yenile

    } catch (error: any) {
        alert("Hata: " + error.message);
    }
  };

  // --- TÜM GÜNÜ KAPATMA ---
  const handleBlockDay = async () => {
    if (!blockDate) { alert("Lütfen bir tarih seçin."); return; }

    const blockedService = services.find(s => s.name.includes("KAPALI"));
    if (!blockedService) { alert("Servis bulunamadı."); return; }

    if (!confirm(`DİKKAT: ${blockDate} tarihindeki TÜM GÜNÜ kapatmak üzeresiniz. Emin misiniz?`)) return;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        const inserts = [];

        // Sabah 09'dan Akşam 18'e kadar döngü kur
        for (const time of timeSlots) {
            const [hours, minutes] = time.split(':');
            const startTime = new Date(blockDate);
            startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            const endTime = new Date(startTime);
            endTime.setMinutes(startTime.getMinutes() + 60);

            inserts.push({
                customer_id: user?.id,
                service_id: blockedService.id,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                status: 'blocked'
            });
        }

        const { error } = await supabase.from("appointments").insert(inserts);

        if (error) throw error;
        alert("Tüm gün başarıyla kapatıldı! ⛔");
        window.location.reload();

    } catch (error: any) {
        alert("Hata: " + error.message);
    }
  };

  // Randevu İptal/Silme (Blok kaldırmak için de kullanılır)
  const handleDelete = async (id: string) => {
      if(!confirm("Silmek istediğinize emin misiniz?")) return;
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if(!error) {
          setAppointments(appointments.filter(app => app.id !== id));
      }
  };

  if (loading) return <div className="p-10 text-center">Yönetici Paneli Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Yönetici Paneli</h1>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Calendar /></div>
            <div>
              <p className="text-sm text-gray-500">Aktif Randevu</p>
              <h3 className="text-2xl font-bold">{stats.totalApp}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600"><DollarSign /></div>
            <div>
              <p className="text-sm text-gray-500">Tahmini Ciro</p>
              <h3 className="text-2xl font-bold">{stats.totalRevenue} ₺</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. MESAİ KAPATMA PANELİ (YENİ) */}
          <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100 lg:col-span-1 h-fit">
            <div className="flex items-center gap-2 mb-4 text-red-700">
                <Ban className="w-6 h-6" />
                <h2 className="text-xl font-bold">Müsaitliği Kapat</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Seçtiğiniz tarih veya saat için dükkanı kapatır.</p>
            
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Tarih Seç</label>
                    <input 
                        type="date" 
                        className="w-full p-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onChange={(e) => setBlockDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Saat Seç</label>
                    <select 
                        className="w-full p-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onChange={(e) => setBlockTime(e.target.value)}
                    >
                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button 
                        onClick={handleBlockSlot}
                        className="bg-white border border-red-300 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition flex flex-col items-center justify-center text-xs"
                    >
                        <Clock className="w-4 h-4 mb-1" />
                        BU SAATİ KAPAT
                    </button>
                    <button 
                        onClick={handleBlockDay}
                        className="bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition flex flex-col items-center justify-center text-xs shadow-lg shadow-red-200"
                    >
                        <Ban className="w-4 h-4 mb-1" />
                        TÜM GÜNÜ KAPAT
                    </button>
                </div>
            </div>
          </div>

          {/* 2. RANDEVU LİSTESİ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Randevular & Engeller</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {appointments.map((app) => (
                <div key={app.id} className={`p-4 border rounded-xl transition flex justify-between items-center ${
                    app.status === 'blocked' ? 'bg-red-50 border-red-100' : 'bg-white hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-4">
                     {/* Simge */}
                     <div className={`p-3 rounded-full ${app.status === 'blocked' ? 'bg-red-200 text-red-700' : 'bg-pink-100 text-primary'}`}>
                        {app.status === 'blocked' ? <Ban className="w-5 h-5"/> : <Users className="w-5 h-5"/>}
                     </div>
                     
                     <div>
                      <div className="font-bold text-gray-900">
                          {app.status === 'blocked' ? "⛔ ENGEL / KAPALI" : (app.profiles?.full_name || "İsimsiz")}
                      </div>
                      <div className="text-sm text-gray-500">
                          {app.status === 'blocked' ? "Yönetici Kapattı" : app.profiles?.phone}
                      </div>
                      <div className="text-sm font-medium text-primary mt-1">
                          {app.services?.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                        <div className="font-bold">{new Date(app.start_time).toLocaleDateString("tr-TR")}</div>
                        <div className="text-sm text-gray-500">{new Date(app.start_time).toLocaleTimeString("tr-TR", {hour:'2-digit', minute:'2-digit'})}</div>
                    </div>
                    {/* SİL BUTONU */}
                    <button 
                        onClick={() => handleDelete(app.id)}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                    >
                        Sil / Aç
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        
        {/* HİZMET FİYATLARI ALTTA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
            <h2 className="text-xl font-bold mb-4">Hizmet Fiyatlarını Düzenle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.filter(s => !s.name.includes("KAPALI")).map((service) => (
                <div key={service.id} className="flex flex-col gap-2 p-4 border rounded-xl">
                  <span className="font-medium text-gray-700">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      defaultValue={service.price}
                      className="w-full p-2 border rounded-lg"
                      onBlur={(e) => updatePrice(service.id, e.target.value)}
                    />
                    <span className="text-gray-500">₺</span>
                  </div>
                </div>
              ))}
            </div>
        </div>

      </div>
    </main>
  );
}