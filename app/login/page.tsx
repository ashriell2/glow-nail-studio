"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Giriş mi Kayıt mı?
  
  // Form verileri
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Telefon numarasını temizle ve email formatına çevir
    const cleanPhone = phone.replace(/\D/g, ''); 
    const fakeEmail = `${cleanPhone}@glownail.com`;

    try {
      if (isSignUp) {
        // --- KAYIT OLMA ---
        const { data, error } = await supabase.auth.signUp({
          email: fakeEmail,
          password,
          options: {
            data: {
              role: 'customer', // <--- YENİ GELEN HERKES MÜŞTERİDİR!
              full_name: fullName,
              phone: cleanPhone 
            },
          },
        });
        if (error) throw error;
        
        // Profil tablosuna da ekleyelim (Garanti olsun)
        if (data.user) {
            await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: fullName,
                phone: cleanPhone,
                role: 'customer'
            });
        }
        alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        setIsSignUp(false); // Giriş ekranına döndür

      } else {
        // --- GİRİŞ YAPMA ---
        const { error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password,
        });
        if (error) throw error;

        // BAŞARILI İSE -> PROFİLE GİT (Admin'e değil!)
        router.push("/profile");
        router.refresh();
      }
    } catch (error: any) {
      alert("İşlem başarısız: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-pink-100">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
                {isSignUp ? "Aramıza Katıl ✨" : "Hoş Geldiniz 💅"}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
                {isSignUp ? "Randevu almak için hemen kayıt oluştur." : "Randevularını yönetmek için giriş yap."}
            </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input 
                required type="text" placeholder="Örn: Ayşe Yılmaz"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
            <input 
              required type="tel" placeholder="0555 123 45 67"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input 
              required type="password" placeholder="******"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-pink-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-pink-200"
          >
            {loading ? "İşleniyor..." : (isSignUp ? "Kayıt Ol" : "Giriş Yap")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {isSignUp ? "Zaten hesabın var mı? " : "Hesabın yok mu? "}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-bold hover:underline"
          >
            {isSignUp ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
             <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Ana Sayfaya Dön</Link>
        </div>
      </div>
    </main>
  );
}