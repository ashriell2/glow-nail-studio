"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { Check, ChevronLeft, ChevronRight, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);

  useEffect(() => {
    // Giriş kontrolü
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
    };
    checkUser();
    
    const fetchData = async () => {
      // Hizmetleri çek
      const { data: servicesData } = await supabase.from("services").select("*").order('id');
      if (servicesData) setServices(servicesData.filter(s => !s.name.includes("KAPALI"))); // Gizli servisi gösterme

      // Dolu randevuları çek
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("start_time");
      
      if (appointmentsData) {
        const slots = appointmentsData.map(app => new Date(app.start_time).toISOString());
        setTakenSlots(slots);
      }
    };
    fetchData();
  }, [router]);

  const isSlotBooked = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':');
    const checkDate = new Date(date);
    checkDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return takenSlots.some(slotISO => {
      const takenDate = new Date(slotISO);
      return takenDate.getTime() === checkDate.getTime();
    });
  };

  const handleBooking = async (date: Date, time: string) => {
    if (!selectedService) return;
    if(!confirm(`${selectedService.name} için randevu oluşturulsun mu?`)) return;

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
      setTakenSlots([...takenSlots, startTime.toISOString()]);
      
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + (weekOffset * 7) + i);
      return d;
  });
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      {loading && <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center"><Loader2 className="animate-spin"/></div>}

      <div className="max-w-7xl mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold mb-2">Randevu Oluştur</h1>
        
        {/* Hizmet Seçimi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={`p-4 rounded-xl border-2 text-left relative ${selectedService?.id === service.id ? "border-primary bg-pink-50" : "border-gray-200"}`}
            >
              <div className="font-bold">{service.name}</div>
              <div className="text-sm text-gray-500">{service.price} ₺</div>
              {selectedService?.id === service.id && <Check className="absolute top-3 right-3 text-primary w-4 h-4"/>}
            </button>
          ))}
        </div>

        {/* Takvim */}
        {selectedService && (
          <div>
            <div className="flex justify-between mb-4">
               <h2 className="font-bold">Tarih Seçin</h2>
               <div className="flex gap-2">
                 <button onClick={()=>setWeekOffset(weekOffset-1)} disabled={weekOffset===0}><ChevronLeft/></button>
                 <button onClick={()=>setWeekOffset(weekOffset+1)}><ChevronRight/></button>
               </div>
            </div>
            <div className="overflow-x-auto border rounded-xl">
              <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 border-b bg-gray-50">
                      <div className="p-4">Saat</div>
                      {weekDays.map((d,i)=><div key={i} className="p-4 text-center font-bold border-l">{d.getDate()} <span className="text-xs block text-gray-400">{d.toLocaleDateString('tr-TR',{weekday:'short'})}</span></div>)}
                  </div>
                  {timeSlots.map(time => (
                      <div key={time} className="grid grid-cols-8 border-b last:border-0">
                          <div className="p-3 text-center text-sm text-gray-500">{time}</div>
                          {weekDays.map((d,i) => (
                              <div key={i} className="p-1 border-l h-14">
                                  {isSlotBooked(d, time) ? 
                                      <button disabled className="w-full h-full bg-red-50 text-red-300 text-xs font-bold rounded flex items-center justify-center"><XCircle className="w-3 h-3 mr-1"/> DOLU</button> :
                                      <button onClick={()=>handleBooking(d, time)} className="w-full h-full bg-green-50 hover:bg-primary hover:text-white text-green-700 text-xs font-bold rounded transition">Müsait</button>
                                  }
                              </div>
                          ))}
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