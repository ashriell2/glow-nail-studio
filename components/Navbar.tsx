import Link from "next/link";
import { Sparkles, Calendar, User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-pink-100 fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Sol Taraf: Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Glow Nail Studio
            </span>
          </Link>

          {/* Sağ Taraf: Butonlar */}
          <div className="flex items-center gap-4">
            
            {/* Profilim Linki (Yeni Eklediğimiz) */}
            <Link 
              href="/profile"
              className="text-gray-600 hover:text-primary transition font-medium text-sm flex items-center gap-1"
            >
               <User className="w-4 h-4" />
               Profilim
            </Link>

            {/* Randevu Al Butonu */}
            <Link
              href="/book"
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-full font-medium transition shadow-lg shadow-primary/30 hover:shadow-primary/50"
            >
              <Calendar className="w-4 h-4" />
              <span>Randevu Al</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}