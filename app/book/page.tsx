"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Check, ChevronLeft, ChevronRight, Loader2, XCircle } from "lucide-react"; // XCircle ikonu eklendi
import { useRouter } from "next/navigation";

export default function BookPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [takenSlots, setTakenSlots] = useState<string[]>([]); // Dolu saatleri tutacak liste

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
    };
    checkUser();
    
    const fetchData = async () => {
      // 1. Hizmetleri Çek
      const { data: servicesData } = await supabase.from("services").select("*");
      if (servicesData) setServices(servicesData);

      // 2. DOLU RANDEVULARI ÇEK
      // Sadece 'pending' (onay bekleyen) ve onaylanmışları alalım, iptal edilenleri almayalım.
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("start_time");
      
      if (appointmentsData) {
        // Gelen tarihleri listeye atıyoruz
        const slots = appointmentsData.map(app => new Date(app.start_time).toISOString());
        setTakenSlots(slots);
      }
    };
    fetchData();
  }, [router]);

  // --- KONTROL MEKANİZMASI ---
  // Bir kutucuğun tarih ve saati dolu mu diye bakar
  const isSlotBooked = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':');
    
    // Kontrol edilecek saati oluştur
    const checkDate = new Date(date);
    checkDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Listede bu saat var mı diye bak (Milisaniye cinsinden karşılaştırma en garantisidir)
    return takenSlots.some(slotISO => {
      const takenDate = new Date(slotISO);
      return takenDate.getTime() === checkDate.getTime();
    });
  };
  // ---------------------------

  const handleBooking = async (date: Date, time: string) => {
    if (!selectedService) return;
    
    if(!confirm(`${selectedService.name} için ${date.toLocaleDateString()} saat ${time}'a randevu oluşturulsun mu?`)) return;

    setLoading(true);
    try {
      const [hours, minutes] = time.split(':');
      const startTime = new Date(date);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + selectedService.duration_min);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      const { error } = await supabase.from("appointments").insert({
        customer_id: user.id,
        service_id: selectedService.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });

      if (error) throw error;

      alert("Randevunuz başarıyla oluşturuldu! Teşekkür ederiz.");
      
      // Sayfayı yenilemeden kutuyu kırmızı yapmak için listeyi güncelle
      setTakenSlots([...takenSlots, startTime.toISOString()]);
      
    } catch (error: any) {
      console.error(error);
      alert("Hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    today.setDate(today.getDate() + (weekOffset * 7));
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <p className="mt-4 font-bold text-gray-600">Randevunuz Oluşturuluyor...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Randevu Oluştur</h1>
        <p className="text-gray-500 mb-8">Lütfen önce işlem, sonra tarih seçiniz.</p>

        {/* 1. ADIM: HİZMET SEÇİMİ */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">1. Hizmet Seçimi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-4 rounded-xl border-2 text-left transition relative ${
                  selectedService?.id === service.id
                    ? "border-primary bg-pink-50 ring-2 ring-primary ring-offset-2"
                    : "border-gray-200 bg-white hover:border-pink-200"
                }`}
              >
                <div className="font-bold text-gray-900">{service.name}</div>
                <div className="text-sm text-gray-500 mt-1">{service.duration_min} Dakika • {service.price} ₺</div>
                {selectedService?.id === service.id && (
                  <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 2. ADIM: TAKVİM */}
        {selectedService && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">2. Tarih ve Saat Seçimi</h2>
              <div className="flex gap-2">
                <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 hover:bg-gray-100 rounded-full" disabled={weekOffset === 0}>
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-8 border-b border-gray-100">
                  <div className="p-4 text-center font-bold text-gray-400 bg-gray-50">Saat</div>
                  {weekDays.map((date, i) => (
                    <div key={i} className="p-4 text-center border-l border-gray-100">
                      <div className="text-xs font-semibold text-primary uppercase">
                        {date.toLocaleDateString("tr-TR", { weekday: "short" })}
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b border-gray-100 last:border-0">
                    <div className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 flex items-center justify-center">
                      {time}
                    </div>
                    {weekDays.map((date, i) => {
                      // BURASI ÖNEMLİ: KONTROL EDİYORUZ
                      const booked = isSlotBooked(date, time);
                      
                      return (
                        <div key={i} className="p-1 border-l border-gray-100 h-16 relative group">
                          {booked ? (
                            // DOLU İSE BU BUTON GÖZÜKÜR
                            <button 
                              disabled
                              className="w-full h-full rounded-lg bg-red-50 text-red-400 border border-red-100 flex flex-col items-center justify-center cursor-not-allowed opacity-80"
                            >
                               <span className="text-xs font-bold flex items-center gap-1">
                                 <XCircle className="w-3 h-3" /> DOLU
                               </span>
                            </button>
                          ) : (
                            // BOŞ İSE BU BUTON GÖZÜKÜR
                            <button 
                              onClick={() => handleBooking(date, time)}
                              className="w-full h-full rounded-lg bg-green-50 hover:bg-primary hover:text-white text-green-700 transition flex flex-col items-center justify-center gap-1"
                            >
                               <span className="text-xs font-bold">Müsait</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}