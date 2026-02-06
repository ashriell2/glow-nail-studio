"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, ''); 
    const fakeEmail = `${cleanPhone}@glownail.com`;

    try {
      if (isSignUp) {
        // --- KAYIT OLMA ---
        const { data, error } = await supabase.auth.signUp({
          email: fakeEmail, password,
          options: { data: { role: 'customer', full_name: fullName, phone: cleanPhone } },
        });
        if (error) throw error;
        if (data.user) {
            await supabase.from('profiles').upsert({ id: data.user.id, full_name: fullName, phone: cleanPhone, role: 'customer' });
        }
        alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        setIsSignUp(false);
      } else {
        // --- GİRİŞ YAPMA ---
        const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password });
        if (error) throw error;
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
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      
      {/* SOL TARAF: SENİN FOTOĞRAFIN (Mobilde Gizli) */}
      <div className="hidden lg:block relative h-full bg-gray-100">
        <Image
          // Public klasörüne attığın fotoğraf
          src="/login-bg.jpg"
          alt="Glow Nail Studio Login"
          fill
          className="object-cover"
          priority
        />
        {/* Fotoğrafın üzerine çok hafif bir pembe ton, yazıyı kapatmasın diye şeffaf */}
        <div className="absolute inset-0 bg-pink-900/10 mix-blend-multiply" />
      </div>

      {/* SAĞ TARAF: FORM */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
               {isSignUp ? "Aramıza Katıl ✨" : "Hoş Geldiniz 💅"}
            </h1>
            <p className="mt-2 text-gray-500 text-sm">
               {isSignUp ? "Randevu almak için bilgilerini gir." : "Devam etmek için giriş yap."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="mt-8 space-y-6">
            <div className="space-y-4">
                {isSignUp && (
                    <div>
                        <label className="text-sm font-medium text-gray-700 ml-1">Ad Soyad</label>
                        <input required type="text" placeholder="Adınız Soyadınız"
                            className="w-full p-4 mt-1 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                )}
                
                <div>
                    <label className="text-sm font-medium text-gray-700 ml-1">Telefon Numarası</label>
                    <input required type="tel" placeholder="0555 123 45 67"
                        className="w-full p-4 mt-1 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 ml-1">Şifre</label>
                    <input required type="password" placeholder="******"
                        className="w-full p-4 mt-1 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 text-white font-bold rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all shadow-lg shadow-pink-200"
            >
              {loading ? "İşleniyor..." : (isSignUp ? "Kayıt Ol ve Devam Et" : "Giriş Yap")}
            </button>
          </form>

          <div className="text-center pt-4">
             <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-gray-500 hover:text-pink-600 font-medium underline decoration-pink-300">
                {isSignUp ? "Zaten hesabın var mı? Giriş Yap" : "Hesabın yok mu? Hemen Kayıt Ol"}
             </button>
          </div>

          <div className="text-center mt-8">
             <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← Ana Sayfaya Dön</Link>
          </div>

        </div>
      </div>
    </div>
  );
}