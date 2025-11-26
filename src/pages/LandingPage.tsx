import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, User, X, CheckCircle, ArrowRight, Menu } from 'lucide-react';
import landingImage from '../assets/landingimages.png';
import logoImage from '../assets/logo-apotek.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDirections = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=Jl.+Brigjend+Katamso+Medan', '_blank');
  };

  // Simplified styles: Removed floating, sliding, and complex delays
  const customStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .animate-fade-in { 
      animation: fadeIn 0.6s ease-out forwards; 
    }
  `;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 overflow-x-hidden">
      <style>{customStyles}</style>
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-100 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="Apotik Sukaraja Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-emerald-900 tracking-tight">Apotik Sukaraja</h1>
                <p className="text-xs text-emerald-600">Mitra Kesehatan Medan</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Beranda</a>
              <a href="#services" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Layanan</a>
              <a href="#location" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Lokasi</a>
              <a href="#" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Katalog</a>
            </div>

            {/* Desktop Actions - Removed Search & Cart */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5"
              >
                <User size={18} />
                <span>Masuk</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-4 shadow-lg animate-fade-in">
            <a href="#" className="block text-slate-600 font-medium">Beranda</a>
            <a href="#services" className="block text-slate-600 font-medium">Layanan</a>
            <a href="#location" className="block text-slate-600 font-medium">Lokasi</a>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/login');
              }}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium"
            >
              Masuk
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-emerald-50/50 pt-16 pb-24 lg:pt-32 lg:pb-40 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0 text-center lg:text-left">
              <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
                Apotek Terpercaya di Medan
              </span>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                Kesehatan Anda Adalah <span className="text-emerald-600">Prioritas</span> Kami
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Menyediakan obat-obatan berkualitas, vitamin, dan konsultasi kesehatan profesional langsung dari Jl. Brigjend Katamso ke depan pintu Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
                >
                  Belanja Obat <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-semibold transition-all hover:-translate-y-1"
                >
                  Unggah Resep
                </button>
              </div>
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span>Apoteker Berlisensi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span>Produk Asli</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Simplified background blob, removed pulse */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200 to-transparent rounded-full opacity-20 blur-3xl transform translate-x-10 translate-y-10"></div>
              <img 
                src={landingImage} 
                alt="Pharmacy Display" 
                className="relative rounded-3xl shadow-2xl border-4 border-white object-cover w-full h-auto"
              />
              
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-emerald-50 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Jam Operasional</p>
                    <p className="font-bold text-slate-800">08:00 WIB - 22:00 WIB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Layanan Kesehatan Komprehensif</h2>
            <p className="text-slate-500">Kami menyediakan lebih dari sekadar obat. Rasakan pendekatan holistik kami untuk kesehatan masyarakat.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Tebus Resep', desc: 'Unggah resep dokter Anda dan kami akan siapkan obatnya.', icon: '💊' },
              { title: 'Konsultasi Kesehatan', desc: 'Konsultasi dasar gratis dengan apoteker bersertifikat kami.', icon: '🩺' },
              { title: 'Alat Kesehatan', desc: 'Pengukur tekanan darah, termometer, dan lainnya.', icon: '🔬' },
            ].map((item, idx) => (
              <div key={idx} className="group p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-emerald-600 hover:text-white transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-xl">
                <div className="text-4xl mb-6 bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-500 group-hover:text-emerald-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20 bg-emerald-900 text-white relative overflow-hidden animate-fade-in">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Kunjungi Apotik Sukaraja</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <MapPin className="text-emerald-400 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-lg">Alamat</h3>
                    <p className="text-emerald-100">Jl. Brigjend Katamso No. XX</p>
                    <p className="text-emerald-100">Medan, Sumatera Utara, Indonesia</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group">
                  <Phone className="text-emerald-400 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-lg">Hubungi Kami</h3>
                    <p className="text-emerald-100">+62 61 1234 5678</p>
                    <p className="text-emerald-100">halo@apotiksukaraja.com</p>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleDirections}
                    className="bg-white text-emerald-900 px-8 py-3 rounded-lg font-bold hover:bg-emerald-50 transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    Petunjuk Arah
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-200 h-80 w-full rounded-2xl overflow-hidden shadow-2xl relative group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15928.252753246905!2d98.66779963955081!3d3.5729425999999984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x303130491b692d95%3A0xee21291bf7a87fa4!2sApotik%20Sukaraja!5e0!3m2!1sid!2sid!4v1764151871229!5m2!1sid!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                loading="lazy" 
                allowFullScreen={true}
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Apotik Sukaraja"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white pt-16 pb-8 border-t border-slate-100 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <h3 className="font-bold text-xl text-emerald-900 mb-4">Apotik Sukaraja</h3>
              <p className="text-slate-500 text-sm">Melayani masyarakat Medan dengan kepedulian, integritas, dan kualitas sejak 2020.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Tautan Cepat</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Karir</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Berlangganan</h4>
              <div className="flex gap-2">
                <input type="email" placeholder="Alamat email" className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm w-full outline-none focus:border-emerald-500 transition-all" />
                <button className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors hover:shadow-md">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} Apotik Sukaraja Medan. Hak Cipta Dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;