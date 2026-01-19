"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { Users, Calendar, DollarSign, Save } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalApp: 0, totalRevenue: 0 });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      // 1. Admin Kontrolü
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata.role !== 'admin') {
        alert("Bu sayfaya erişim yetkiniz yok!");
        router.push("/"); // Ana sayfaya kov
        return;
      }

      // 2. Tüm Randevuları Çek
      const { data: appData } = await supabase
        .from("appointments")
        .select(`*, profiles(full_name, phone), services(name, price)`)
        .order("start_time", { ascending: false });

      if (appData) {
        setAppointments(appData);
        // Basit İstatistik Hesabı
        const revenue = appData.reduce((acc, curr) => acc + (curr.services?.price || 0), 0);
        setStats({ totalApp: appData.length, totalRevenue: revenue });
      }

      // 3. Hizmetleri Çek
      const { data: serviceData } = await supabase.from("services").select("*").order("id");
      if (serviceData) setServices(serviceData);

      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [router]);

  // Hizmet Fiyatı Güncelleme
  const updatePrice = async (id: number, newPrice: string) => {
    const price = parseInt(newPrice);
    if (isNaN(price)) return;

    const { error } = await supabase
      .from("services")
      .update({ price })
      .eq("id", id);

    if (!error) {
      alert("Fiyat güncellendi!");
    }
  };

  if (loading) return <div className="p-10 text-center">Yönetici Paneli Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Yönetici Paneli</h1>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Calendar /></div>
            <div>
              <p className="text-sm text-gray-500">Toplam Randevu</p>
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
             <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Users /></div>
             <div>
               <p className="text-sm text-gray-500">Müşteri Sayısı</p>
               <h3 className="text-2xl font-bold">--</h3>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Randevu Listesi */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Son Randevular</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {appointments.map((app) => (
                <div key={app.id} className="p-4 border rounded-xl hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900">{app.profiles?.full_name || "İsimsiz"}</div>
                      <div className="text-sm text-gray-500">{app.profiles?.phone}</div>
                      <div className="text-sm font-medium text-primary mt-1">{app.services?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{new Date(app.start_time).toLocaleDateString("tr-TR")}</div>
                      <div className="text-sm text-gray-500">{new Date(app.start_time).toLocaleTimeString("tr-TR", {hour:'2-digit', minute:'2-digit'})}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hizmet Yönetimi */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Hizmet Fiyatlarını Düzenle</h2>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-xl">
                  <span className="font-medium text-gray-700">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      defaultValue={service.price}
                      className="w-24 p-2 border rounded-lg text-right"
                      onBlur={(e) => updatePrice(service.id, e.target.value)} // Odaktan çıkınca kaydet
                    />
                    <span className="text-gray-500">₺</span>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-2">* Fiyatı değiştirip kutudan çıktığınızda otomatik kaydedilir.</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}