import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, LayoutDashboard, Plus, Trash2, Edit, Search, Filter, Tags, Folder } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Product {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  description: string;
  location: string;
  farm: string;
  category?: string;
  images: string[];
  dietary: string[];
  createdAt: string;
}

interface Order {
  id: string;
  customerInfo: {
    fullName: string;
    address: string;
    city: string;
    country: string;
    state: string;
    zipCode: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: string;
    priceValue: number;
    quantity: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'categories' | 'add-product' | 'settings' | 'pages'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
  });
  
  // Site settings state - Initialize from localStorage cache
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('siteSettings');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error reading cached site settings:', error);
    }
    return {
      title: 'World Peas',
      description: '新鲜健康的农产品直送到家',
    };
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  
  // Pages content state - Initialize from localStorage cache
  const [pagesContent, setPagesContent] = useState(() => {
    try {
      const cached = localStorage.getItem('pagesContent');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error reading cached pages content:', error);
    }
    return {
      newsstand: {
        title: '新闻厅',
        content: '',
      },
      about: {
        title: '关于我们',
        content: '',
      },
    };
  });
  const [pagesSaved, setPagesSaved] = useState(false);

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    priceValue: '',
    description: '',
    location: '',
    farm: '',
    category: '',
    imageUrl: '',
    dietary: [] as string[],
  });

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e9343d87`;

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const productsResponse = await fetch(`${baseUrl}/products`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }

      const ordersResponse = await fetch(`${baseUrl}/orders`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
      }

      const categoriesResponse = await fetch(`${baseUrl}/categories`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
      
      // Load site settings
      const settingsResponse = await fetch(`${baseUrl}/settings`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSiteSettings(settingsData);
      }
      
      // Load pages content
      const pagesResponse = await fetch(`${baseUrl}/pages`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        setPagesContent(pagesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      priceValue: '',
      description: '',
      location: '',
      farm: '',
      category: '',
      imageUrl: '',
      dietary: [],
    });
    setEditingProduct(null);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = {
        name: formData.name,
        price: formData.price,
        priceValue: parseFloat(formData.priceValue),
        description: formData.description,
        location: formData.location,
        farm: formData.farm,
        category: formData.category,
        images: formData.imageUrl ? [formData.imageUrl] : [],
        dietary: formData.dietary,
        isFavorite: false,
      };

      const url = editingProduct 
        ? `${baseUrl}/products/${editingProduct.id}`
        : `${baseUrl}/products`;
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        alert(editingProduct ? '产品更新成功！' : '产品添加成功！');
        resetForm();
        setActiveTab('products');
        loadData();
      } else {
        alert('操作失败');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('操作时出错');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      priceValue: product.priceValue.toString(),
      description: product.description,
      location: product.location,
      farm: product.farm,
      category: product.category || '',
      imageUrl: product.images[0] || '',
      dietary: product.dietary || [],
    });
    setActiveTab('add-product');
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？')) return;
    
    try {
      const response = await fetch(`${baseUrl}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });

      if (response.ok) {
        alert('产品已删除');
        loadData();
      } else {
        alert('删除产品失败');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('删除产品时出错');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${baseUrl}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert('订单状态已更新');
        loadData();
      } else {
        alert('更新订单状态失败');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('更新订单时出错');
    }
  };

  const toggleDietary = (value: string) => {
    setFormData(prev => ({
      ...prev,
      dietary: prev.dietary.includes(value)
        ? prev.dietary.filter(d => d !== value)
        : [...prev.dietary, value]
    }));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.farm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const category = {
        name: categoryFormData.name,
        description: categoryFormData.description,
      };

      const url = editingCategory 
        ? `${baseUrl}/categories/${editingCategory.id}`
        : `${baseUrl}/categories`;
      
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(category),
      });

      if (response.ok) {
        alert(editingCategory ? '分类更新成功！' : '分类添加成功！');
        setCategoryFormData({
          name: '',
          description: '',
        });
        setEditingCategory(null);
        setShowCategoryModal(false);
        loadData();
      } else {
        alert('操作失败');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('操作时出错');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;
    
    try {
      const response = await fetch(`${baseUrl}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });

      if (response.ok) {
        alert('分类已删除');
        loadData();
      } else {
        alert('删除分类失败');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('删除分类时出错');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(siteSettings),
      });

      if (response.ok) {
        // Update localStorage cache immediately
        localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
        setSettingsSaved(true);
        alert('网站设置已保存！');
        // Reload to refresh settings across the app
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert('保存设置失败');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('保存设置时出错');
    }
  };

  const handleSavePages = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/pages`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(pagesContent),
      });

      if (response.ok) {
        // Update localStorage cache immediately
        localStorage.setItem('pagesContent', JSON.stringify(pagesContent));
        setPagesSaved(true);
        alert('页面内容已保存！');
        // Reload to refresh settings across the app
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert('保存页面内容失败');
      }
    } catch (error) {
      console.error('Error saving pages:', error);
      alert('保存页面内容时出错');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">电商管理后台</h1>
              <p className="text-sm text-gray-500">管理你的产品和订单</p>
            </div>
            <a
              href="/"
              className="px-4 py-2 bg-[#176d38] text-white rounded-lg hover:bg-[#145a2e] transition"
            >
              返回商店
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-[#176d38] text-[#176d38]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutDashboard size={20} />
              <span>仪表盘</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'products'
                  ? 'border-b-2 border-[#176d38] text-[#176d38]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package size={20} />
              <span>产品管理</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'orders'
                  ? 'border-b-2 border-[#176d38] text-[#176d38]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingCart size={20} />
              <span>订单管理</span>
              {stats.pendingOrders > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingOrders}
                </span>
              )}
            </button>
            <button
              onClick={() => { resetForm(); setActiveTab('add-product'); }}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'add-product'
                  ? 'border-b-2 border-[#176d38] text-[#176d38]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plus size={20} />
              <span>添加产品</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'categories'
                  ? 'border-b-2 border-[#176d38] text-[#176d38]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Tags size={20} />
              <span>分类管理</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'settings'
                  ? 'border-b-2 border-[#176d38] text-[#176d38]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Folder size={20} />
              <span>网站设置</span>
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'pages'
                  ? 'border-b-2 border-[#176d38] text-[#176d38]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Folder size={20} />
              <span>页面内容</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading && activeTab !== 'add-product' ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">概览</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="text-blue-600 text-sm font-medium mb-2">总产品数</div>
                      <div className="text-3xl font-bold text-blue-900">{stats.totalProducts}</div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="text-green-600 text-sm font-medium mb-2">总订单数</div>
                      <div className="text-3xl font-bold text-green-900">{stats.totalOrders}</div>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <div className="text-yellow-600 text-sm font-medium mb-2">待处理订单</div>
                      <div className="text-3xl font-bold text-yellow-900">{stats.pendingOrders}</div>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <div className="text-purple-600 text-sm font-medium mb-2">总营收</div>
                      <div className="text-3xl font-bold text-purple-900">¥{stats.totalRevenue.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">最新产品</h3>
                      <div className="space-y-3">
                        {products.slice(0, 5).map(product => (
                          <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            {product.images[0] && (
                              <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-4">最新订单</h3>
                      <div className="space-y-3">
                        {orders.slice(0, 5).map(order => (
                          <div key={order.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">{order.customerInfo.fullName}</div>
                              <div className="text-sm font-semibold text-[#176d38]">¥{order.total.toFixed(2)}</div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleString('zh-CN')}
                            </div>
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status === 'pending' ? '待处理' :
                                 order.status === 'processing' ? '处理中' :
                                 order.status === 'shipped' ? '已发货' :
                                 order.status === 'delivered' ? '已送达' : '已取消'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products List */}
              {activeTab === 'products' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">产品管理 ({filteredProducts.length})</h2>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="搜索产品..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border rounded-lg w-64"
                        />
                      </div>
                    </div>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="text-center text-gray-500 py-20">
                      暂无产品，请添加产品
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left p-4 font-semibold">产品</th>
                            <th className="text-left p-4 font-semibold">价格</th>
                            <th className="text-left p-4 font-semibold">分类</th>
                            <th className="text-left p-4 font-semibold">供应商</th>
                            <th className="text-left p-4 font-semibold">创建时间</th>
                            <th className="text-right p-4 font-semibold">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product) => (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {product.images[0] && (
                                    <img
                                      src={product.images[0]}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">{product.price}</td>
                              <td className="p-4">
                                {product.category ? (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {product.category}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </td>
                              <td className="p-4 text-sm">{product.farm}</td>
                              <td className="p-4 text-sm text-gray-500">
                                {new Date(product.createdAt).toLocaleDateString('zh-CN')}
                              </td>
                              <td className="p-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    title="编辑"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    title="删除"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Orders List */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">订单管理 ({orders.length})</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center text-gray-500 py-20">
                      暂无订单
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{order.customerInfo.fullName}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                订单号: {order.id}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(order.createdAt).toLocaleString('zh-CN')}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#176d38] mb-2">
                                ¥{order.total.toFixed(2)}
                              </div>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="border rounded px-3 py-1.5 text-sm"
                              >
                                <option value="pending">待处理</option>
                                <option value="processing">处理中</option>
                                <option value="shipped">已发货</option>
                                <option value="delivered">已送达</option>
                                <option value="cancelled">已取消</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">收货地址</div>
                              <div className="text-sm">
                                <p>{order.customerInfo.address}</p>
                                <p>{order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.zipCode}</p>
                                <p>{order.customerInfo.country}</p>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">购买商品</div>
                              <div className="text-sm space-y-1">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span className="text-gray-600">¥{(item.priceValue * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add/Edit Product Form */}
              {activeTab === 'add-product' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">
                    {editingProduct ? '编辑产品' : '添加新产品'}
                  </h2>
                  
                  <form onSubmit={handleAddProduct} className="max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">产品名称 *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="例如：有机苹果"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">价格显示 *</label>
                        <input
                          type="text"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="¥10.00 每个"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">价格数值 *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.priceValue}
                          onChange={(e) => setFormData({ ...formData, priceValue: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="10.00"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">描述 *</label>
                        <textarea
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          rows={4}
                          placeholder="产品的详细描述..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">农场/供应商 *</label>
                        <input
                          type="text"
                          required
                          value={formData.farm}
                          onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="例如：阳光农场"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">产地</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="例如：山东烟台"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">分类</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2.5"
                        >
                          <option value="">选择分类...</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">先在"分类管理"中创建分类</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">饮食标签</label>
                        <div className="flex gap-2">
                          {['VG', 'GF', 'DF'].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleDietary(tag)}
                              className={`px-4 py-2 rounded-lg border transition ${
                                formData.dietary.includes(tag)
                                  ? 'bg-[#176d38] text-white border-[#176d38]'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#176d38]'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">VG=素食 GF=无麸质 DF=无乳制品</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">图片URL</label>
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="https://..."
                        />
                        {formData.imageUrl && (
                          <img
                            src={formData.imageUrl}
                            alt="预览"
                            className="mt-4 w-40 h-40 object-cover rounded-lg border"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                      <button
                        type="submit"
                        className="flex-1 bg-[#176d38] text-white py-3 rounded-lg font-semibold hover:bg-[#145a2e] transition"
                      >
                        {editingProduct ? '更新产品' : '添加产品'}
                      </button>
                      {editingProduct && (
                        <button
                          type="button"
                          onClick={() => { resetForm(); setActiveTab('products'); }}
                          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                          取消
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Categories List */}
              {activeTab === 'categories' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">分类管理 ({categories.length})</h2>
                    <button
                      onClick={() => { setCategoryFormData({ name: '', description: '' }); setEditingCategory(null); setShowCategoryModal(true); }}
                      className="px-4 py-2 bg-[#176d38] text-white rounded-lg hover:bg-[#145a2e] transition"
                    >
                      添加分类
                    </button>
                  </div>

                  {categories.length === 0 ? (
                    <div className="text-center text-gray-500 py-20">
                      暂无分类，请添加分类
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left p-4 font-semibold">分类名称</th>
                            <th className="text-left p-4 font-semibold">描述</th>
                            <th className="text-left p-4 font-semibold">创建时间</th>
                            <th className="text-right p-4 font-semibold">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category) => (
                            <tr key={category.id} className="border-b hover:bg-gray-50">
                              <td className="p-4">{category.name}</td>
                              <td className="p-4">{category.description}</td>
                              <td className="p-4 text-sm text-gray-500">
                                {new Date(category.createdAt).toLocaleDateString('zh-CN')}
                              </td>
                              <td className="p-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEditCategory(category)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    title="编辑"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    title="删除"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Category Modal */}
              {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    <h2 className="text-xl font-bold mb-6">
                      {editingCategory ? '编辑分类' : '添加新分类'}
                    </h2>
                    
                    <form onSubmit={handleAddCategory} className="max-w-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-2">分类名称 *</label>
                          <input
                            type="text"
                            required
                            value={categoryFormData.name}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2.5"
                            placeholder="例如：水果"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-2">描述</label>
                          <textarea
                            value={categoryFormData.description}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2.5"
                            rows={4}
                            placeholder="分类的详细描述..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-8">
                        <button
                          type="submit"
                          className="flex-1 bg-[#176d38] text-white py-3 rounded-lg font-semibold hover:bg-[#145a2e] transition"
                        >
                          {editingCategory ? '更新分类' : '添加分类'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCategoryFormData({ name: '', description: '' }); setEditingCategory(null); setShowCategoryModal(false); }}
                          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Settings */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">网站设置</h2>
                  
                  <form onSubmit={handleSaveSettings} className="max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">网站标题 *</label>
                        <input
                          type="text"
                          required
                          value={siteSettings.title}
                          onChange={(e) => setSiteSettings({ ...siteSettings, title: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="例如：World Peas"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">网站描述 *</label>
                        <textarea
                          required
                          value={siteSettings.description}
                          onChange={(e) => setSiteSettings({ ...siteSettings, description: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          rows={4}
                          placeholder="网站的详细描述..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                      <button
                        type="submit"
                        className="flex-1 bg-[#176d38] text-white py-3 rounded-lg font-semibold hover:bg-[#145a2e] transition"
                      >
                        保存设置
                      </button>
                      {settingsSaved && (
                        <button
                          type="button"
                          onClick={() => setSettingsSaved(false)}
                          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                          重置
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
              
              {/* Pages */}
              {activeTab === 'pages' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">页面内容</h2>
                  
                  <form onSubmit={handleSavePages} className="max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">新闻厅标题 *</label>
                        <input
                          type="text"
                          required
                          value={pagesContent.newsstand.title}
                          onChange={(e) => setPagesContent({ ...pagesContent, newsstand: { ...pagesContent.newsstand, title: e.target.value } })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="例如：新闻厅"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">新闻厅内容 *</label>
                        <textarea
                          required
                          value={pagesContent.newsstand.content}
                          onChange={(e) => setPagesContent({ ...pagesContent, newsstand: { ...pagesContent.newsstand, content: e.target.value } })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          rows={4}
                          placeholder="新闻厅的详细内容..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">关于我们标题 *</label>
                        <input
                          type="text"
                          required
                          value={pagesContent.about.title}
                          onChange={(e) => setPagesContent({ ...pagesContent, about: { ...pagesContent.about, title: e.target.value } })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          placeholder="例如：关于我们"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">关于我们内容 *</label>
                        <textarea
                          required
                          value={pagesContent.about.content}
                          onChange={(e) => setPagesContent({ ...pagesContent, about: { ...pagesContent.about, content: e.target.value } })}
                          className="w-full border rounded-lg px-4 py-2.5"
                          rows={4}
                          placeholder="关于我们页面的详细内容..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                      <button
                        type="submit"
                        className="flex-1 bg-[#176d38] text-white py-3 rounded-lg font-semibold hover:bg-[#145a2e] transition"
                      >
                        保存页面内容
                      </button>
                      {pagesSaved && (
                        <button
                          type="button"
                          onClick={() => setPagesSaved(false)}
                          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                          重置
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}