import React, { useEffect, useState } from 'react';
import { 
  LogOut, Search, ShoppingCart, MapPin, Plus, Store, User, 
  History, Package, Trash2, X, Upload, Image as ImageIcon, 
  TrendingUp, CheckCircle, Truck, AlertCircle, Eye, Settings, Save, 
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://azqiqjdrugvphepfgmff.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cWlxamRydWd2cGhlcGZnbWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDM5OTUsImV4cCI6MjA3OTcxOTk5NX0.vVIqctAhkV7wM-GogE505JbDaF6uV7Q-71FAZ4GuTII"
const supabase = createClient(supabaseUrl, supabaseKey);

type UserRole = 'admin' | 'customer';
type OrderStatus = 'pending' | 'awaiting_payment' | 'awaiting_verification' | 'processed' | 'shipped' | 'completed' | 'cancelled';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  address?: string;
}

interface Category {
  id: number;
  name: string;
}

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
}

interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
  product_images?: ProductImage[];
}

interface CartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  products: Product; 
}

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product_name_snapshot: string;
}

interface Order {
  id: number;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  shipping_tracking_number: string;
  shipping_cost: number;
  courier: string;
  proof_of_payment_url?: string;
  created_at: string;
  profiles?: Profile;
  order_items?: OrderItem[];
}

const COURIERS = [
  { id: 'jne', name: 'JNE Reguler', cost: 12000, etd: '2-3 Hari' },
  { id: 'jnt', name: 'J&T Express', cost: 15000, etd: '2-3 Hari' },
  { id: 'gosend', name: 'GoSend Instant', cost: 35000, etd: 'Hari ini' },
  { id: 'pickup', name: 'Ambil Sendiri', cost: 0, etd: '-' },
];

const BANK_INFO = {
  bank: 'BCA',
  number: '8830-1234-5678',
  name: 'APOTIK SUKARAJA'
};

const ApotikSukarajaApp = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'cart' | 'orders' | 'profile' | 'admin-products' | 'admin-orders'>('home');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminOrderFilter, setAdminOrderFilter] = useState<'all' | 'new' | 'process' | 'shipped'>('all');

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [selectedCourier, setSelectedCourier] = useState(COURIERS[0]);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const [isAdminVerifyModalOpen, setIsAdminVerifyModalOpen] = useState(false);
  const [orderToVerify, setOrderToVerify] = useState<Order | null>(null);

  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stock: '', category_id: '', is_active: true });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', address: '' });

  useEffect(() => { fetchSession(); }, []);

  useEffect(() => {
    if (profile) {
      fetchProducts();
      fetchCategories();
      fetchCart();
      if (activeTab === 'orders' || activeTab === 'admin-orders') fetchOrders();
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
      setCheckoutAddress(profile.address || '');
    }
  }, [profile, activeTab, selectedCategory, searchQuery]);

  const fetchSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; } 
    
    let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!data) {
        const { data: newProfile } = await supabase.from('profiles').insert({ id: user.id, email: user.email, full_name: 'Pelanggan Baru' }).select().single();
        data = newProfile;
    }
    setProfile(data);
    setLoading(false);
  };

  const handleLogin = async () => {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) alert("Error login: " + error.message);
      else fetchSession();
  }

  const handleLogout = async () => {
      await supabase.auth.signOut();
      setProfile(null);
      setCart([]);
      setOrders([]);
      setActiveTab('home');
  }

  const fetchProducts = async () => {
    let query = supabase
      .from('products')
      .select(`*, product_images ( id, image_url, is_primary )`)
      .order('id', { ascending: false });
      
    if (selectedCategory !== 'all') query = query.eq('category_id', selectedCategory);
    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);
    if (profile?.role !== 'admin') query = query.eq('is_active', true);
    
    const { data } = await query;
    if (data) setProducts(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const fetchCart = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('cart_items')
      .select(`
        id, quantity, product_id, user_id,
        products (
          id, name, price, stock, category_id, description, is_active,
          product_images (image_url, is_primary)
        )
      `)
      .eq('user_id', profile.id);
      
    if (data) setCart(data as any);
  };

  const fetchOrders = async () => {
    let query = supabase
      .from('orders')
      .select(`
        *, 
        profiles!orders_user_id_fkey(full_name, email, phone),
        order_items(product_name_snapshot, quantity, unit_price)
      `)
      .order('created_at', { ascending: false });

    if (profile?.role !== 'admin') {
      query = query.eq('user_id', profile?.id);
    }
    
    const { data } = await query;
    if (data) setOrders(data);
  };

  const getProductImage = (product: Product) => {
    if (product?.product_images && product.product_images.length > 0) {
      const img = product.product_images.find(i => i.is_primary) || product.product_images[0];
      return img.image_url;
    }
    return `https://placehold.co/400x400/f1f5f9/475569?text=${encodeURIComponent(product?.name?.substring(0, 3).toUpperCase() || 'NA')}`;
  };

  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'awaiting_payment': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'awaiting_verification': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'processed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const addToCart = async (product: Product) => {
    if (!profile) return alert("Silahkan login terlebih dahulu");
    try {
      if (product.stock < 1) return alert("Stok habis");
      
      const existing = cart.find(c => c.product_id === product.id);
      if (existing) return alert("Produk sudah ada di keranjang");

      const { error } = await supabase.from('cart_items').insert({
        user_id: profile.id, product_id: product.id, quantity: 1
      });
      if (error) throw error;
      fetchCart();
    } catch (err) { alert("Gagal menambah keranjang"); }
  };

  const removeFromCart = async (id: number) => {
    await supabase.from('cart_items').delete().eq('id', id);
    fetchCart();
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    const { error } = await supabase.from('profiles').update({
      full_name: profileForm.full_name,
      phone: profileForm.phone,
      address: profileForm.address
    }).eq('id', profile.id);

    if (error) alert("Gagal update profil");
    else {
      setIsEditingProfile(false);
      fetchSession();
    }
  };

  const handleCreateOrder = async () => {
    if (!checkoutAddress.trim()) return alert("Alamat pengiriman wajib diisi!");
    if (!profile) return;

    setIsProcessingCheckout(true);
    try {
      const subtotal = cart.reduce((sum, item) => sum + ((item.products?.price || 0) * item.quantity), 0);
      const totalAmount = subtotal + selectedCourier.cost;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: profile.id,
          total_amount: totalAmount,
          shipping_cost: selectedCourier.cost,
          courier: selectedCourier.name,
          shipping_address: checkoutAddress,
          status: 'pending',
          shipping_tracking_number: `REQ-${Date.now().toString().slice(-6)}`
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.products.id,
        quantity: item.quantity,
        unit_price: item.products.price,
        product_name_snapshot: item.products.name
      }));
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      for (const item of cart) {
        if(item.products) {
            const newStock = Math.max(0, item.products.stock - item.quantity);
            await supabase.from('products').update({ stock: newStock }).eq('id', item.products.id);
        }
      }

      await supabase.from('cart_items').delete().eq('user_id', profile.id);

      setIsProcessingCheckout(false);
      setIsCheckoutModalOpen(false);
      setCart([]);
      setActiveTab('orders');
      alert("Pesanan berhasil dibuat! Silahkan lakukan pembayaran.");
      fetchOrders();
    } catch (error: any) {
      setIsProcessingCheckout(false);
      alert("Gagal membuat pesanan: " + error.message);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedOrderId || !proofFile) return;
    setIsUploadingProof(true);

    try {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `proof_${selectedOrderId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(fileName, proofFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);

      const { error: updateError } = await supabase.from('orders').update({
        proof_of_payment_url: publicUrl,
        status: 'awaiting_verification'
      }).eq('id', selectedOrderId);

      if (updateError) throw updateError;

      setIsUploadingProof(false);
      setIsUploadModalOpen(false);
      setProofFile(null);
      fetchOrders();
      alert("Bukti pembayaran berhasil dikirim untuk diverifikasi Admin.");
    } catch (error: any) {
      setIsUploadingProof(false);
      alert("Gagal upload bukti: " + error.message);
    }
  };

  const handleAdminVerifyPayment = async (isApproved: boolean) => {
    if (!orderToVerify) return;
    const newStatus = isApproved ? 'processed' : 'pending';
    const alertMsg = isApproved ? "Pembayaran diterima. Pesanan masuk status diproses." : "Pembayaran ditolak. Status kembali ke pending.";
    
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderToVerify.id);
    setIsAdminVerifyModalOpen(false);
    setOrderToVerify(null);
    fetchOrders();
    alert(alertMsg);
  };

  const handleAdminShipOrder = async (orderId: number) => {
      const resi = prompt("Masukkan Nomor Resi Pengiriman:");
      if (!resi) return alert("Nomor Resi wajib diisi untuk mengubah status menjadi Dikirim.");

      await supabase.from('orders').update({ 
          status: 'shipped',
          shipping_tracking_number: resi
      }).eq('id', orderId);
      
      fetchOrders();
      alert("Status pesanan diperbarui menjadi DIKIRIM.");
  }

  const handleCompleteOrder = async (orderId: number) => {
    if(!window.confirm("Selesaikan pesanan ini?")) return;
    await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);
    fetchOrders();
  };

  const handleToggleProductActive = async (productId: number, currentStatus: boolean) => {
    await supabase.from('products').update({ is_active: !currentStatus }).eq('id', productId);
    fetchProducts();
  };

  const handleDeleteProduct = async (productId: number) => {
      if(!window.confirm("Hapus produk ini secara permanen?")) return;
      await supabase.from('products').delete().eq('id', productId);
      fetchProducts();
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
    setPreviewUrls(files.map(f => URL.createObjectURL(f)));
  };

  const handleAdminAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingProduct(true);
    try {
      const { data: prod, error } = await supabase.from('products').insert({
        name: newProduct.name, description: newProduct.description,
        price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock),
        category_id: parseInt(newProduct.category_id),
        is_active: newProduct.is_active
      }).select().single();
      if (error) throw error;

      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const fileExt = file.name.split('.').pop();
        const path = `${prod.id}_${Date.now()}_${i}.${fileExt}`;
        
        await supabase.storage.from('product-images').upload(path, file);
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
        
        await supabase.from('product_images').insert({
          product_id: prod.id, image_url: publicUrl, is_primary: i === 0
        });
      }

      setIsUploadingProduct(false);
      setNewProduct({ name: '', description: '', price: '', stock: '', category_id: '', is_active: true });
      setSelectedImages([]);
      setPreviewUrls([]);
      alert("Produk berhasil ditambahkan!");
      fetchProducts();
      setActiveTab('home'); 
    } catch (e: any) { alert(e.message); setIsUploadingProduct(false); }
  };

  const filterAdminOrders = () => {
      if (adminOrderFilter === 'all') return orders;
      if (adminOrderFilter === 'new') return orders.filter(o => o.status === 'pending' || o.status === 'awaiting_payment' || o.status === 'awaiting_verification');
      if (adminOrderFilter === 'process') return orders.filter(o => o.status === 'processed');
      if (adminOrderFilter === 'shipped') return orders.filter(o => o.status === 'shipped');
      return orders;
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans text-slate-600 gap-2 font-bold animate-pulse">Memuat Aplikasi Apotik...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-10">
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800 cursor-pointer" onClick={() => setActiveTab('home')}>
            <Store className="text-emerald-600" /> Apotik<span className="text-emerald-600">Sukaraja</span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setActiveTab('cart')} className="relative p-2 text-slate-600 hover:text-emerald-600 transition-colors">
              <ShoppingCart />
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">{cart.length}</span>}
            </button>
            
            {profile ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 cursor-pointer bg-slate-50 p-1 pr-3 rounded-full border hover:bg-slate-100 transition-colors" onClick={() => setActiveTab('profile')}>
                    <div className="w-8 h-8 bg-emerald-100 rounded-full overflow-hidden border border-emerald-200">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`} alt="avatar" />
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-700">{profile.full_name.split(' ')[0]}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-2"><LogOut size={20}/></button>
                </div>
            ) : (
                <button onClick={handleLogin} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all">Masuk</button>
            )}
          </div>
        </div>
      </nav>

      <div className="bg-white border-b shadow-sm sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 flex gap-4 overflow-x-auto no-scrollbar py-3">
          <button onClick={() => setActiveTab('home')} className={`flex items-center gap-2 text-sm font-bold whitespace-nowrap px-4 py-2 rounded-full transition-all ${activeTab === 'home' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}>
            <Store size={16} /> Belanja
          </button>
          <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 text-sm font-bold whitespace-nowrap px-4 py-2 rounded-full transition-all ${activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}>
            <History size={16} /> Pesanan Saya
          </button>
          
          {profile?.role === 'admin' && (
             <>
               <div className="w-px h-6 bg-slate-200 mx-2 self-center"></div>
               <button onClick={() => setActiveTab('admin-orders')} className={`flex items-center gap-2 text-sm font-bold whitespace-nowrap px-4 py-2 rounded-full transition-all ${activeTab === 'admin-orders' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}>
                 <TrendingUp size={16} /> Admin Order
               </button>
               <button onClick={() => setActiveTab('admin-products')} className={`flex items-center gap-2 text-sm font-bold whitespace-nowrap px-4 py-2 rounded-full transition-all ${activeTab === 'admin-products' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}>
                 <Package size={16} /> Admin Produk
               </button>
             </>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {activeTab === 'home' && (
          <div>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Cari obat..." 
                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
               </div>
               <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`}>Semua</button>
                  {categories.map(c => (
                    <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap ${selectedCategory === c.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`}>{c.name}</button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map(product => (
                <div key={product.id} className={`bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden group relative ${!product.is_active ? 'opacity-60' : ''}`}>
                  {!product.is_active && <div className="absolute inset-0 bg-slate-100/50 z-10 flex items-center justify-center backdrop-blur-[1px]"><span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold">Tidak Aktif</span></div>}
                  
                  <div className="aspect-square bg-slate-50 relative overflow-hidden">
                    <img src={getProductImage(product)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
                  </div>
                  
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1 min-h-[40px]">{product.name}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-emerald-600 font-bold">{formatRupiah(product.price)}</p>
                      <p className="text-[10px] text-slate-500">{product.stock} Stok</p>
                    </div>

                    {profile?.role === 'admin' ? (
                       <div className="flex gap-2 mt-3 z-20 relative">
                          <button onClick={() => handleToggleProductActive(product.id, product.is_active)} className={`flex-1 py-2 rounded-lg flex items-center justify-center ${product.is_active ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                             {product.is_active ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100">
                             <Trash2 size={18}/>
                          </button>
                       </div>
                    ) : (
                        <button 
                          onClick={() => addToCart(product)}
                          disabled={product.stock < 1 || !product.is_active}
                          className="mt-3 w-full py-2 bg-slate-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          {product.stock < 1 ? 'Stok Habis' : <><Plus size={14} /> Keranjang</>}
                        </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex-1 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="text-emerald-600"/> Keranjang Belanja</h2>
              {cart.length === 0 ? <div className="text-center py-16 bg-white rounded-xl border border-dashed"><p className="text-slate-400 font-medium">Keranjang masih kosong.</p></div> : cart.map(item => (
                <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border hover:border-emerald-200 transition-colors shadow-sm relative">
                  <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                    <img src={getProductImage(item.products)} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">{item.products?.name}</h3>
                      <p className="text-emerald-600 text-sm font-bold">{formatRupiah(item.products?.price || 0)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs bg-slate-100 px-3 py-1 rounded-lg font-bold text-slate-600">Jumlah: {item.quantity}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="md:w-96">
                <div className="bg-white p-6 rounded-2xl border shadow-sm sticky top-36">
                  <h3 className="font-bold mb-4 text-slate-800 text-lg">Ringkasan</h3>
                  <div className="flex justify-between mb-3 text-sm text-slate-600">
                    <span>Total Item</span>
                    <span className="font-bold text-slate-800">{cart.length} Barang</span>
                  </div>
                  <div className="flex justify-between mb-4 text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-800">{formatRupiah(cart.reduce((a, b) => a + ((b.products?.price || 0) * b.quantity), 0))}</span>
                  </div>
                  <div className="border-t my-4"></div>
                  <button onClick={() => setIsCheckoutModalOpen(true)} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex justify-between px-6">
                    <span>Checkout</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && profile && (
           <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-300">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                 <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold capitalize">{profile.role}</div>
                 </div>
                 <div className="px-6 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                       <div className="w-24 h-24 bg-white p-1 rounded-full shadow-md">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`} className="w-full h-full rounded-full bg-emerald-50" alt="avatar" />
                       </div>
                       {!isEditingProfile && (
                         <button onClick={() => setIsEditingProfile(true)} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 shadow-sm flex items-center gap-2">
                            <Settings size={16} /> Edit Profil
                         </button>
                       )}
                    </div>
                    
                    {isEditingProfile ? (
                       <div className="space-y-4">
                          <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap</label>
                             <input type="text" className="w-full border rounded-xl p-3 bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-emerald-500" value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Nomor Telepon</label>
                             <input type="text" className="w-full border rounded-xl p-3 bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-emerald-500" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Alamat Utama</label>
                             <textarea rows={3} className="w-full border rounded-xl p-3 bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-emerald-500" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} />
                          </div>
                          <div className="flex gap-3 pt-2">
                             <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 border rounded-xl font-bold text-slate-500 hover:bg-slate-50">Batal</button>
                             <button onClick={handleUpdateProfile} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"><Save size={18} /> Simpan</button>
                          </div>
                       </div>
                    ) : (
                       <div className="space-y-6">
                          <div>
                             <h2 className="text-2xl font-bold text-slate-800">{profile.full_name}</h2>
                             <p className="text-slate-500 flex items-center gap-1.5 mt-1 text-sm">{profile.email}</p>
                          </div>
                          <div className="space-y-3">
                             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="bg-white p-2 rounded-lg text-emerald-600 shadow-sm"><User size={18}/></div>
                                <div><p className="text-xs text-slate-400 font-bold uppercase">Telepon</p><p className="font-medium text-slate-700">{profile.phone || '-'}</p></div>
                             </div>
                             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="bg-white p-2 rounded-lg text-emerald-600 shadow-sm"><MapPin size={18}/></div>
                                <div><p className="text-xs text-slate-400 font-bold uppercase">Alamat</p><p className="font-medium text-slate-700">{profile.address || '-'}</p></div>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        )}

        {(activeTab === 'orders' || activeTab === 'admin-orders') && (
          <div className="max-w-4xl mx-auto">
            {activeTab === 'admin-orders' ? (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Manajemen Pesanan</h2>
                    <div className="bg-white p-1 rounded-xl border flex shadow-sm w-full md:w-auto">
                        <button onClick={() => setAdminOrderFilter('all')} className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${adminOrderFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Semua</button>
                        <button onClick={() => setAdminOrderFilter('new')} className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${adminOrderFilter === 'new' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Baru</button>
                        <button onClick={() => setAdminOrderFilter('process')} className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${adminOrderFilter === 'process' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Diproses</button>
                        <button onClick={() => setAdminOrderFilter('shipped')} className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${adminOrderFilter === 'shipped' ? 'bg-purple-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Dikirim</button>
                    </div>
                </div>
            ) : (
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Riwayat Transaksi</h2>
            )}

            <div className="space-y-4">
              {filterAdminOrders().length === 0 ? <div className="text-center py-12 bg-white rounded-xl border border-dashed"><p className="text-slate-400">Tidak ada pesanan.</p></div> : filterAdminOrders().map(order => (
                <div key={order.id} className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(order.status).replace('text', 'bg').split(' ')[0]}`}></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-slate-100 pb-3 gap-3 pl-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{order.shipping_tracking_number}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                      {activeTab === 'admin-orders' && (
                        <p className="text-xs text-blue-600 mt-1 font-bold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded w-fit"><User size={10} /> {order.profiles?.full_name} — {order.profiles?.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-emerald-600">{formatRupiah(order.total_amount)}</p>
                    </div>
                  </div>

                  <div className="pl-3 mb-4 space-y-1">
                      {order.order_items?.map(item => (
                          <div key={item.id} className="flex justify-between text-sm border-b border-dashed border-slate-100 last:border-0 py-1">
                             <span className="text-slate-600">{item.quantity} x {item.product_name_snapshot}</span>
                             <span className="font-medium text-slate-800">{formatRupiah(item.unit_price * item.quantity)}</span>
                          </div>
                      ))}
                  </div>

                  <div className="pl-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg">
                      <div>
                        <p className="font-bold text-xs text-slate-400 uppercase mb-1">Info Pengiriman</p>
                        <p className="font-semibold text-slate-800">{order.courier}</p>
                        <p className="text-xs mt-1 text-slate-500 leading-relaxed">{order.shipping_address}</p>
                      </div>
                      <div className="md:text-right flex flex-col items-start md:items-end">
                        <p className="font-bold text-xs text-slate-400 uppercase mb-1">Bukti Transfer</p>
                        {order.proof_of_payment_url ? (
                          <a href={order.proof_of_payment_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                            <ImageIcon size={12} /> Lihat Bukti Foto
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Belum diupload</span>
                        )}
                      </div>
                  </div>

                  <div className="pl-3 flex flex-wrap justify-end gap-2 pt-2">
                    {/* CUSTOMER ACTIONS */}
                    {profile?.role !== 'admin' && (order.status === 'pending' || order.status === 'awaiting_payment') && (
                      <button 
                        onClick={() => { setSelectedOrderId(order.id); setIsUploadModalOpen(true); }}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-100 transition-all w-full md:w-auto justify-center"
                      >
                        <Upload size={16} /> Upload Bukti Bayar
                      </button>
                    )}
                    
                    {profile?.role !== 'admin' && order.status === 'shipped' && (
                        <button onClick={() => handleCompleteOrder(order.id)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-700 w-full md:w-auto">Pesanan Diterima</button>
                    )}

                    {/* ADMIN ACTIONS */}
                    {activeTab === 'admin-orders' && order.status === 'awaiting_verification' && (
                        <button onClick={() => { setOrderToVerify(order); setIsAdminVerifyModalOpen(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100 w-full md:w-auto justify-center">
                          <Eye size={16} /> Verifikasi Pembayaran
                        </button>
                    )}
                    {activeTab === 'admin-orders' && order.status === 'processed' && (
                        <button onClick={() => handleAdminShipOrder(order.id)} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 flex items-center gap-2 shadow-lg shadow-purple-100 w-full md:w-auto justify-center">
                          <Truck size={16} /> Kirim Barang (Input Resi)
                        </button>
                    )}
                    {activeTab === 'admin-orders' && order.status === 'shipped' && (
                        <button onClick={() => handleCompleteOrder(order.id)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-100 w-full md:w-auto justify-center">
                          <CheckCircle size={16} /> Selesaikan Pesanan
                        </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin-products' && profile?.role === 'admin' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border shadow-sm">
             <h2 className="font-bold text-lg mb-6 text-slate-800 flex items-center gap-2 pb-4 border-b"><Plus className="bg-emerald-100 text-emerald-600 rounded p-0.5" /> Tambah Produk Baru</h2>
             <form onSubmit={handleAdminAddProduct} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="md:col-span-2">
                     <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nama Produk</label>
                     <input type="text" className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required placeholder="Contoh: Paracetamol 500mg" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Harga (Rp)</label>
                      <input type="number" className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Stok</label>
                      <input type="number" className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Kategori</label>
                      <select className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white outline-none" value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})} required>
                         <option value="">Pilih Kategori</option>
                         {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
                      <select className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white outline-none" value={newProduct.is_active ? 'true' : 'false'} onChange={e => setNewProduct({...newProduct, is_active: e.target.value === 'true'})}>
                         <option value="true">Aktif</option>
                         <option value="false">Sembunyikan</option>
                      </select>
                   </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Deskripsi</label>
                   <textarea className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Penjelasan singkat produk..." />
                </div>
                
                <div className="border-2 border-dashed border-slate-300 p-8 rounded-2xl text-center hover:bg-slate-50 transition-colors cursor-pointer group relative">
                   <input type="file" multiple onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="prod-img" />
                   <div className="flex flex-col items-center gap-3">
                      <div className="bg-emerald-50 p-4 rounded-full text-emerald-600 group-hover:scale-110 transition-transform"><Upload size={24} /></div>
                      <div>
                        <p className="text-blue-600 font-bold">Upload Foto Produk</p>
                        <p className="text-xs text-slate-400">Format: JPG, PNG</p>
                      </div>
                   </div>
                   {previewUrls.length > 0 && (
                      <div className="flex gap-3 mt-6 justify-center flex-wrap">
                         {previewUrls.map((u, i) => <img key={i} src={u} className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-md" />)}
                      </div>
                   )}
                </div>

                <button disabled={isUploadingProduct} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all text-lg">
                  {isUploadingProduct ? 'Sedang Upload...' : 'Simpan Produk'}
                </button>
             </form>
          </div>
        )}
      </main>

      {/* CHECKOUT MODAL */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md md:rounded-3xl rounded-t-3xl p-6 shadow-2xl h-[90vh] md:h-auto overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b">
              <h3 className="font-bold text-xl text-slate-800">Checkout Pengiriman</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Alamat Tujuan</label>
              <textarea 
                value={checkoutAddress} 
                onChange={e => setCheckoutAddress(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white"
                rows={3}
                placeholder="Lengkap dengan kecamatan dan kode pos..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Kurir Pengiriman</label>
              <div className="space-y-2">
                {COURIERS.map(cour => (
                  <div 
                    key={cour.id} 
                    onClick={() => setSelectedCourier(cour)}
                    className={`p-3 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedCourier.id === cour.id ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'hover:bg-slate-50 border-slate-200'}`}
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{cour.name}</p>
                      <p className="text-xs text-slate-500">Estimasi: {cour.etd}</p>
                    </div>
                    <p className="font-bold text-emerald-600 text-sm">{formatRupiah(cour.cost)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Harga</span>
                <span className="font-bold text-slate-700">{formatRupiah(cart.reduce((a, b) => a + ((b.products?.price || 0) * b.quantity), 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ongkos Kirim</span>
                <span className="font-bold text-slate-700">{formatRupiah(selectedCourier.cost)}</span>
              </div>
              <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center">
                <span className="font-bold text-lg text-slate-800">Total Bayar</span>
                <span className="font-bold text-xl text-emerald-600">
                  {formatRupiah(cart.reduce((a, b) => a + ((b.products?.price || 0) * b.quantity), 0) + selectedCourier.cost)}
                </span>
              </div>
            </div>

            <button 
              onClick={handleCreateOrder}
              disabled={isProcessingCheckout}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 shadow-lg shadow-emerald-200 transition-all text-lg"
            >
              {isProcessingCheckout ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD BUKTI MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center">
              <h3 className="font-bold text-lg mb-2">Transfer Pembayaran</h3>
              <p className="text-sm text-slate-500 mb-6">Silahkan transfer ke rekening berikut:</p>
              
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl mb-6 relative overflow-hidden text-left shadow-lg shadow-emerald-200">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                 <p className="font-mono font-bold text-2xl tracking-widest mb-1">{BANK_INFO.number}</p>
                 <p className="text-xs opacity-80 uppercase font-bold tracking-wider">{BANK_INFO.bank} • {BANK_INFO.name}</p>
              </div>

              <div className="mb-6 text-left">
                 <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Bukti Foto / Screenshot</label>
                 <div className="relative">
                   <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border rounded-xl" />
                 </div>
              </div>

              <div className="flex gap-3">
                 <button onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Tutup</button>
                 <button 
                   onClick={handleUploadProof} 
                   disabled={!proofFile || isUploadingProof}
                   className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:bg-slate-300 shadow-lg shadow-emerald-200 transition-all"
                 >
                   {isUploadingProof ? 'Mengirim...' : 'Kirim'}
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* ADMIN VERIFY MODAL */}
      {isAdminVerifyModalOpen && orderToVerify && (
         <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
               <h3 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2">Verifikasi Pembayaran</h3>
               
               <div className="bg-slate-100 rounded-xl overflow-hidden mb-5 border border-slate-200 relative group min-h-[200px] flex items-center justify-center bg-slate-900">
                  {orderToVerify.proof_of_payment_url ? (
                      <a href={orderToVerify.proof_of_payment_url} target="_blank" rel="noreferrer" className="w-full h-full block">
                         <img src={orderToVerify.proof_of_payment_url} className="w-full h-auto object-contain" alt="Bukti" />
                      </a>
                  ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                         <AlertCircle size={32} />
                         <span className="text-sm">Tidak ada foto</span>
                      </div>
                  )}
               </div>
               
               <div className="flex flex-col gap-2 text-sm mb-6 bg-slate-50 p-4 rounded-xl border">
                  <div className="flex justify-between">
                     <span className="text-slate-500">Total Tagihan:</span>
                     <span className="font-bold text-lg text-emerald-600">{formatRupiah(orderToVerify.total_amount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                     <span className="text-slate-500">Customer:</span>
                     <span className="font-bold text-slate-800">{orderToVerify.profiles?.full_name}</span>
                  </div>
               </div>

               <div className="flex gap-3">
                  <button onClick={() => handleAdminVerifyPayment(false)} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-100">Tolak</button>
                  <button onClick={() => handleAdminVerifyPayment(true)} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">Terima Pembayaran</button>
               </div>
               <button onClick={() => setIsAdminVerifyModalOpen(false)} className="w-full mt-4 text-slate-400 text-xs hover:text-slate-600 py-2">Batal / Tutup</button>
            </div>
         </div>
      )}

    </div>
  );
};

export default ApotikSukarajaApp;