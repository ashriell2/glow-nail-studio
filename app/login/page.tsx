"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Phone } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Telefon numarasını temizle ve sahte maile çevir
    const cleanPhone = phone.replace(/\s/g, ''); 
    const fakeEmail = `${cleanPhone}@glownail.com`;

    try {
      if (isSignUp) {
        // --- KAYIT OLMA ---
        const { data, error } = await supabase.auth.signUp({
          email: fakeEmail,
          password,
        });
        if (error) throw error;

        // YENİ KISIM: Kayıt başarılıysa, "profiles" tablosuna temiz veriyi yaz
        if (data.user) {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: fullName,
            phone: cleanPhone // Buraya temiz telefonu yazıyoruz
          });
          
          if (profileError) {
             console.error("Profil hatası:", profileError);
             // Kritik hata değil, devam edebilir
          }
        }

        setMessage({ type: "success", text: "Kayıt başarılı! Şimdi giriş yapabilirsiniz." });
        setIsSignUp(false);
      } else {
        // --- GİRİŞ YAPMA ---
        const { error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password,
        });
        if (error) throw error;
        
        router.push("/book");
        router.refresh();
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: "İşlem başarısız. Bilgileri kontrol edin." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-pink-100 p-8">
          
          <div className="text-center mb-8">
            <div className="inline-flex bg-pink-50 p-3 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isSignUp ? "Glow Ailesine Katıl" : "Tekrar Hoşgeldiniz"}
            </h1>
            <p className="text-gray-500 mt-2">
              {isSignUp ? "Randevularınızı yönetmek için hesap oluşturun." : "Randevu almak için giriş yapın."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary outline-none"
                  placeholder="Örn: Ayşe Yılmaz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-200 focus:border-primary outline-none"
                  placeholder="0555 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary outline-none"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? "Kayıt Ol" : "Giriş Yap")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">
              {isSignUp ? "Zaten hesabınız var mı?" : "Henüz hesabınız yok mu?"}
            </span>
            <button onClick={() => setIsSignUp(!isSignUp)} className="ml-2 font-bold text-primary hover:underline">
              {isSignUp ? "Giriş Yap" : "Hemen Kayıt Ol"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}