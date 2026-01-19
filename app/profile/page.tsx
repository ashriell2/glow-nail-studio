"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Trash2, User } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const getData = async () => {
      // 1. Kullanıcı Giriş Yapmış mı?
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Profil Bilgilerini Çek (Ad, Telefon)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(profileData);

      // 3. Randevuları Çek (Hizmet adıyla birlikte!)
      // select içinde '*, services(*)' diyerek iki tabloyu birleştiriyoruz.
      const { data: appointmentData } = await supabase
        .from("appointments")
        .select(`
          *,
          services ( name, price, duration_min )
        `)
        .eq("customer_id", user.id)
        .order("start_time", { ascending: true }); // En yakın tarih en üstte

      if (appointmentData) setAppointments(appointmentData);
      setLoading(false);
    };

    getData();
  }, [router]);

  // Randevu İptal Etme Fonksiyonu
  const handleCancel = async (id: string) => {
    if (!confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;

    const { error } = await supabase.from("appointments").delete().eq("id", id);
    
    if (!error) {
      alert("Randevu iptal edildi.");
      // Listeden silineni ekrandan da kaldır
      setAppointments(appointments.filter((app) => app.id !== id));
    } else {
      alert("Hata oluştu.");
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 pt-24">
        
        {/* Üst Kısım: Profil Kartı */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 flex items-center gap-4 mb-8">
          <div className="bg-pink-100 p-4 rounded-full">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name || "Misafir Kullanıcı"}</h1>
            <p className="text-gray-500">{profile?.phone ? `0${profile.phone}` : "Telefon yok"}</p>
          </div>
        </div>

        {/* Alt Kısım: Randevularım */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Randevularım</h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">Henüz aktif bir randevunuz yok.</p>
            <button 
              onClick={() => router.push("/book")}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Hemen Randevu Al
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => {
              const startDate = new Date(app.start_time);
              return (
                <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition">
                  
                  {/* Sol: Tarih ve Hizmet */}
                  <div className="flex items-start gap-4">
                    <div className="bg-pink-50 text-primary-dark font-bold rounded-xl p-3 text-center min-w-[80px]">
                      <div className="text-sm uppercase">{startDate.toLocaleDateString("tr-TR", { month: "short" })}</div>
                      <div className="text-2xl">{startDate.getDate()}</div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{app.services?.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {startDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div>{app.services?.price} ₺</div>
                      </div>
                      {/* Durum Etiketi */}
                      <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {app.status === 'pending' ? 'Onay Bekliyor' : 'Onaylandı'}
                      </span>
                    </div>
                  </div>

                  {/* Sağ: İptal Butonu */}
                  <button 
                    onClick={() => handleCancel(app.id)}
                    className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    İptal Et
                  </button>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}