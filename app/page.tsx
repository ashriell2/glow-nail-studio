"use client"; // Bunu en üste ekle
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Bağlantımızı çağırıyoruz
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    // Veritabanından hizmetleri çek
    const fetchServices = async () => {
      const { data, error } = await supabase.from("services").select("*");
      if (data) setServices(data);
      if (error) console.error("Hata:", error);
    };
    fetchServices();
  }, []);

  return (
    <main className="min-h-screen bg-background text-gray-900">
      <Navbar />
      <Hero />
      
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Hizmetlerimiz</h2>
          
          {/* Veritabanı Test Alanı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length === 0 ? (
              <p>Yükleniyor...</p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="p-6 border rounded-xl shadow-sm hover:shadow-md transition bg-surface">
                  <h3 className="text-xl font-bold text-primary">{service.name}</h3>
                  <p className="text-gray-500 mt-2">{service.duration_min} Dakika</p>
                  <p className="text-2xl font-bold mt-4">{service.price} ₺</p>
                </div>
              ))
            )}
          </div>

        </div>
      </section>
    </main>
  );
}