import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 opacity-30">
        <div className="w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 text-center lg:text-left space-y-8">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
            Tarzını Parmak <br />
            <span className="text-primary">Uçlarına Taşı.</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/book" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 rounded-full font-bold transition flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
              Hemen Randevu Al
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 relative">
           {/* Resim Alanı */}
           <div className="bg-gray-100 rounded-3xl h-96 w-full flex items-center justify-center text-gray-400">
              Görsel Alanı
           </div>
        </div>
      </div>
    </div>
  );
}