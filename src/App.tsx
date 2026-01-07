import React, { useState, useMemo, useEffect } from 'react';
import { projectId, publicAnonKey } from './utils/supabase/info';

// Import all page components
import ProductListPage from './components/ProductListPage';
import ProductDetailPage from './components/ProductDetailPage';
import BasketPage from './components/BasketPage';
import CheckoutPage from './components/CheckoutPage';
import PaymentPage from './components/PaymentPage';
import ConfirmationPage from './components/ConfirmationPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import PlaceholderPage from './components/PlaceholderPage';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AddToCartOverlay from './components/AddToCartOverlay';
import Menu from './components/Menu';
import AdminApp from './components/AdminApp';

type View = 'list' | 'detail' | 'cart' | 'admin' | 'login' | 'signup';
type SortOption = 'default' | 'price';

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
  isFavorite: boolean;
  createdAt: string;
}

interface CartItem {
  id: number;
  name: string;
  price: string;
  priceValue: number;
  image: string;
  quantity: number;
}

interface OverlayProduct {
  id: number;
  name: string;
  image: string;
}

interface CustomerInfo {
  fullName: string;
  address: string;
  city: string;
  country: string;
  state: string;
  zipCode: string;
}

export default function App() {
  // Check if we're on the admin route
  const [isAdminRoute, setIsAdminRoute] = useState(
    window.location.pathname === '/admin' || window.location.hash === '#/admin'
  );

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminRoute(window.location.hash === '#/admin');
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // If admin route, show admin app
  if (isAdminRoute) {
    return <AdminApp />;
  }

  // Otherwise, show the mobile shop app
  return <ShopApp />;
}

function ShopApp() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Empty string means "All Products"
  const [categories, setCategories] = useState<string[]>([]);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [viewMode, setViewMode] = useState<View>('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize siteSettings from localStorage cache if available
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('siteSettings');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error reading cached site settings:', error);
    }
    return { title: 'World Peas', description: '新鲜健康的农产品直送到家' };
  });
  
  // Initialize pagesContent from localStorage cache if available
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
      newsstand: { title: '新闻厅', content: '' },
      about: { title: '关于我们', content: '' },
    };
  });
  
  // User authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{ fullName: string; email: string; avatarUrl?: string } | null>(null);
  
  // Customer information from checkout
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    address: '',
    city: '',
    country: '',
    state: '',
    zipCode: ''
  });
  
  // Add to cart overlay state
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayProduct, setOverlayProduct] = useState<OverlayProduct | null>(null);
  const [overlayQuantity, setOverlayQuantity] = useState(1);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e9343d87`;

  // Load products from database
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSiteSettings();
    loadPagesContent();
    checkLoginStatus();
  }, []);

  // Update document title and meta description when site settings change
  useEffect(() => {
    document.title = siteSettings.title;
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', siteSettings.description);
  }, [siteSettings]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/products`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${baseUrl}/categories`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      if (response.ok) {
        const data = await response.json();
        const categoryNames = data.map((cat: any) => cat.name);
        setCategories(categoryNames);
      } else {
        console.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const response = await fetch(`${baseUrl}/settings`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data);
        localStorage.setItem('siteSettings', JSON.stringify(data));
      } else {
        console.error('Failed to load site settings');
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };

  const loadPagesContent = async () => {
    try {
      const response = await fetch(`${baseUrl}/pages`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPagesContent(data);
        localStorage.setItem('pagesContent', JSON.stringify(data));
      } else {
        console.error('Failed to load pages content');
      }
    } catch (error) {
      console.error('Error loading pages content:', error);
    }
  };

  const checkLoginStatus = async () => {
    const token = localStorage.getItem('supabase_access_token');
    if (token) {
      try {
        const supabase = await import('./utils/supabase/client').then(m => m.getSupabaseClient());

        const { data, error } = await supabase.auth.getUser(token);
        
        if (data.user && !error) {
          setIsLoggedIn(true);
          setUserInfo({
            fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            avatarUrl: data.user.user_metadata?.avatar_url,
          });
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('supabase_access_token');
          setIsLoggedIn(false);
          setUserInfo(null);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const fetchUserInfo = async (token: string) => {
    // This function is no longer needed as we check using Supabase directly
    return null;
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;
    
    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search term
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case 'price':
        return filtered.sort((a, b) => a.priceValue - b.priceValue);
      default:
        return filtered;
    }
  }, [products, searchTerm, sortOption, selectedCategory]);

  const toggleFavorite = (productId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const showAddToCartOverlay = (product: Product, quantity = 1) => {
    setOverlayProduct({
      id: product.id,
      name: product.name,
      image: product.images[0]
    });
    setOverlayQuantity(quantity);
    setShowOverlay(true);

    // Hide overlay after 1 second
    setTimeout(() => {
      setShowOverlay(false);
    }, 1000);
  };

  const addToCart = (productId?: number, quantityToAdd = 1) => {
    let targetProduct;
    
    if (productId) {
      targetProduct = products.find(p => p.id === productId);
    } else if (selectedProduct) {
      targetProduct = selectedProduct;
    }
    
    if (!targetProduct) return;

    // Show overlay
    showAddToCartOverlay(targetProduct, quantityToAdd);

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === targetProduct.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === targetProduct.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      } else {
        return [...prevItems, {
          id: targetProduct.id,
          name: targetProduct.name,
          price: targetProduct.price,
          priceValue: targetProduct.priceValue,
          image: targetProduct.images[0],
          quantity: quantityToAdd
        }];
      }
    });
  };

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  // Navigation handlers
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProduct(null);
    // Re-check login status after login/signup
    checkLoginStatus();
  };

  const handleCartClick = () => {
    setViewMode('cart');
  };

  const handleBackFromBasket = () => {
    setViewMode('list');
  };

  const handleGoToCheckout = () => {
    setViewMode('checkout');
  };

  const handleBackFromCheckout = () => {
    setViewMode('cart');
  };

  const handleProceedToPayment = (customerData: CustomerInfo) => {
    setCustomerInfo(customerData);
    setViewMode('payment');
  };

  const handleBackFromPayment = () => {
    setViewMode('checkout');
  };

  const handleProceedToConfirmation = () => {
    setViewMode('confirmation');
  };

  const handleBackFromConfirmation = () => {
    setViewMode('payment');
  };

  const handleCompletePurchase = async () => {
    // Save order to Supabase
    try {
      const total = cartItems.reduce((sum, item) => sum + (item.priceValue * item.quantity), 0);
      const orderData = {
        customerInfo,
        items: cartItems,
        total,
      };

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9343d87/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        console.log('Order saved successfully');
      } else {
        console.error('Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
    }

    // Show order confirmation and clear cart
    setViewMode('orderConfirmation');
    setCartItems([]);
  };

  const handleShopFromOrderConfirmation = () => {
    setViewMode('list');
    setSelectedProduct(null);
    // Reset customer info for new order
    setCustomerInfo({
      fullName: '',
      address: '',
      city: '',
      country: '',
      state: '',
      zipCode: ''
    });
  };

  const handleMenuNavigation = (screen: string) => {
    setViewMode(screen as View);
    setSelectedProduct(null);
  };

  // Render current view based on viewMode
  const renderCurrentView = () => {
    switch (viewMode) {
      case 'list':
        return (
          <ProductListPage
            products={filteredAndSortedProducts}
            favorites={favorites}
            searchTerm={searchTerm}
            sortOption={sortOption}
            selectedCategory={selectedCategory}
            categories={categories}
            cartCount={cartCount}
            siteTitle={siteSettings.title}
            onSearchChange={setSearchTerm}
            onSortChange={setSortOption}
            onCategoryChange={setSelectedCategory}
            onToggleFavorite={toggleFavorite}
            onAddToCart={(productId) => addToCart(productId, 1)}
            onProductClick={handleProductClick}
            onMenuClick={() => setIsNavOpen(true)}
            onCartClick={handleCartClick}
          />
        );
      
      case 'detail':
        return selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            cartCount={cartCount}
            onBack={handleBackToList}
            onAddToCart={(quantity) => addToCart(undefined, quantity)}
            onMenuClick={() => setIsNavOpen(true)}
            onCartClick={handleCartClick}
            siteTitle={siteSettings.title}
          />
        ) : null;
      
      case 'cart':
        return (
          <BasketPage
            cartItems={cartItems}
            onBack={handleBackFromBasket}
            onMenuClick={() => setIsNavOpen(true)}
            onUpdateQuantity={updateCartItemQuantity}
            onGoToCheckout={handleGoToCheckout}
            siteTitle={siteSettings.title}
          />
        );
      
      case 'checkout':
        return (
          <CheckoutPage
            cartCount={cartCount}
            customerInfo={customerInfo}
            onBack={handleBackFromCheckout}
            onMenuClick={() => setIsNavOpen(true)}
            onProceedToPayment={handleProceedToPayment}
            siteTitle={siteSettings.title}
          />
        );
      
      case 'payment':
        return (
          <PaymentPage
            cartCount={cartCount}
            onBack={handleBackFromPayment}
            onMenuClick={() => setIsNavOpen(true)}
            onProceedToConfirmation={handleProceedToConfirmation}
            siteTitle={siteSettings.title}
          />
        );
      
      case 'confirmation':
        return (
          <ConfirmationPage
            cartItems={cartItems}
            cartCount={cartCount}
            onBack={handleBackFromConfirmation}
            onMenuClick={() => setIsNavOpen(true)}
            onUpdateQuantity={updateCartItemQuantity}
            onCompletePurchase={handleCompletePurchase}
            siteTitle={siteSettings.title}
          />
        );
      
      case 'orderConfirmation':
        return (
          <OrderConfirmationPage
            cartCount={0} // Cart is cleared after purchase
            customerInfo={customerInfo}
            onShop={handleShopFromOrderConfirmation}
            onMenuClick={() => setIsNavOpen(true)}
            siteTitle={siteSettings.title}
          />
        );
      
      case 'newsstand':
      case 'about':
        return (
          <PlaceholderPage 
            title={viewMode === 'newsstand' ? pagesContent.newsstand.title : pagesContent.about.title}
            content={viewMode === 'newsstand' ? pagesContent.newsstand.content : pagesContent.about.content}
            onBack={handleBackToList}
            onMenuClick={() => setIsNavOpen(true)}
            cartCount={cartCount}
            siteTitle={siteSettings.title}
          />
        );
      
      case 'profile':
        return (
          <ProfilePage
            onBack={handleBackToList}
            onMenuClick={() => setIsNavOpen(true)}
            cartCount={cartCount}
            siteTitle={siteSettings.title}
          />
        );
      
      case 'login':
        return (
          <LoginPage
            onLoginSuccess={handleBackToList}
            onNavigateToSignup={() => setViewMode('signup')}
            siteTitle={siteSettings.title}
          />
        );
      
      case 'signup':
        return (
          <SignupPage
            onSignupSuccess={handleBackToList}
            onNavigateToLogin={() => setViewMode('login')}
            siteTitle={siteSettings.title}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* iPhone 16 Container */}
      <div className="w-[393px] h-[852px] bg-[#ffffff] relative overflow-hidden rounded-[40px] shadow-2xl border-8 border-black">
        
        {renderCurrentView()}

        {/* Add to Cart Overlay */}
        <AddToCartOverlay
          isVisible={showOverlay}
          product={overlayProduct}
          quantity={overlayQuantity}
        />

        {/* Custom Menu */}
        <Menu
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          onNavigate={handleMenuNavigation}
          isLoggedIn={isLoggedIn}
          userInfo={userInfo || undefined}
        />
      </div>
    </div>
  );
}