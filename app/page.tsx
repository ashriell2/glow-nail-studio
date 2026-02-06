"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-white">
      {/* Navbar */}
      <Navbar />

      {/* ANA BANNER ALANI (Ekranı ikiye böler) */}
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-64px)] mt-16">
        
        {/* --- SOL TARAF: METİN VE BUTON --- */}
        <div className="flex items-center p-8 lg:p-24">
          <div className="space-y-8 max-w-2xl">
            {/* Başlıklar */}
            <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight">
                    Tarzını <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Parmak Uçlarına</span> Taşı.
                </h1>
                <p className="text-xl text-gray-600 font-medium leading-relaxed">
                    Glow Nail Studio ile kendinizi şımartın. Modern tasarımlar, uzman bakım ve size özel bir deneyim için hemen randevunuzu oluşturun.
                </p>
            </div>
            
            {/* Buton */}
            <div>
                <Link 
                    href="/book"
                    className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-white rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg shadow-pink-200"
                >
                    Hemen Randevu Al 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </Link>
            </div>
            
            {/* Alt Bilgi */}
            <div className="flex items-center gap-8 text-sm font-bold text-gray-400 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Hızlı & Kolay Randevu
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    Profesyonel Hizmet
                </div>
            </div>

          </div>
        </div>

        {/* --- SAĞ TARAF: FOTOĞRAF (Mobilde gizlenir) --- */}
        <div className="hidden lg:block relative h-full min-h-[600px] bg-gray-50">
          <Image
            // public klasörüne attığın fotoğrafın ismi
            src="/banner.jpg"
            alt="Glow Nail Studio Banner"
            fill // Alanı doldur
            style={{ objectFit: 'cover' }} // Fotoğrafı keserek tam oturt
            priority // Hızlı yüklensin
            className="grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out" // Siyah-beyaz başla, üzerine gelince renklen (İsteğe bağlı)
          />
          {/* Fotoğrafın üzerine hafif bir doku/filtre ekleyebiliriz */}
          <div className="absolute inset-0 bg-pink-900/10 mix-blend-multiply"></div>
        </div>

      </div>
    </main>
  );
}