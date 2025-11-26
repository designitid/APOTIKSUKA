import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Kata sandi tidak cocok.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      setLoading(false);
      return;
    }

    try {
      // Sign up with Supabase
      // Note: The 'full_name' in options.data will be used by the DB trigger to create the profile
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // If session exists, auto-login successful (Email confirmation disabled)
        // If session is null, email confirmation is required
        if (data.session) {
          navigate('/user-dashboard');
        } else {
          // You might want to show a success message or modal here
          alert('Registrasi berhasil! Silakan cek email Anda untuk verifikasi sebelum masuk.');
          navigate('/login');
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Visual */}
        <div className="w-full md:w-1/2 bg-emerald-800 p-12 text-white flex flex-col justify-between relative overflow-hidden order-last md:order-first">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')] opacity-10"></div>
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center text-emerald-100 hover:text-white transition-colors mb-8">
              <ArrowLeft size={20} className="mr-2" />
              Kembali ke Beranda
            </Link>
            <h2 className="text-4xl font-bold mb-4">Bergabung Bersama Kami</h2>
            <p className="text-emerald-100 text-lg">
              Buat akun untuk mulai memesan obat, konsultasi, dan mengelola kesehatan keluarga Anda dengan mudah.
            </p>
          </div>
          <div className="relative z-10 mt-12">
            <div className="bg-emerald-700/50 p-4 rounded-xl border border-emerald-600 backdrop-blur-sm">
              <p className="text-sm italic">"Mencegah lebih baik daripada mengobati. Mulai hidup sehat hari ini."</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800">Daftar Akun Baru</h3>
            <p className="text-slate-500 mt-2">Lengkapi data diri Anda untuk mendaftar</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Nama Lengkap Anda"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="nama@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Minimal 6 karakter"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-200 focus:border-emerald-500'
                  }`}
                  placeholder="Ulangi kata sandi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 mt-6"
            >
              {loading ? (
                <span>Mendaftarkan...</span>
              ) : (
                <>
                  <UserPlus size={20} />
                  Daftar Sekarang
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
                Masuk Disini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;