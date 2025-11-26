import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        navigate('/user-dashboard');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Gagal masuk. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        <div className="w-full md:w-1/2 bg-emerald-800 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-10"></div>
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center text-emerald-100 hover:text-white transition-colors mb-8">
              <ArrowLeft size={20} className="mr-2" />
              Kembali ke Beranda
            </Link>
            <h2 className="text-4xl font-bold mb-4">Selamat Datang Kembali</h2>
            <p className="text-emerald-100 text-lg">
              Masuk untuk mengakses resep digital, riwayat pembelian, dan konsultasi kesehatan Anda.
            </p>
          </div>
          <div className="relative z-10 mt-12">
            <div className="bg-emerald-700/50 p-4 rounded-xl border border-emerald-600 backdrop-blur-sm">
              <p className="text-sm italic">"Kesehatan adalah investasi terbaik untuk masa depan Anda."</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800">Masuk Akun</h3>
            <p className="text-slate-500 mt-2">Silakan masuk dengan akun terdaftar Anda</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="nama@email.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Kata Sandi</label>
                <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline">
                  Lupa kata sandi?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <LogIn size={20} />
                  Masuk Sekarang
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500">
              Belum punya akun?{' '}
              <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;