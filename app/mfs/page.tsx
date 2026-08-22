"use client";

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Share2, 
  FileText, 
  Smartphone, 
  UserCheck, 
  QrCode, 
  Wallet, 
  Globe,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  Users,
  DollarSign,
  Repeat,
  Percent,
  Shield,
  BarChart3,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Store,
  Settings,
  ClipboardList,
  PieChart,
  X,
  Bell,
  Search,
  Filter,
  ExternalLink,
  Zap,
  Flame,
  Droplet,
  Wifi,
  Clock,
  Calendar,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  Info,
  ChevronRight,
  Menu
} from 'lucide-react';

const modules = [
  { id: 'all', name: 'সব ফিচার', icon: Globe },
  { id: 'cellfin', name: 'সেলফিন', icon: Smartphone },
  { id: 'bkash', name: 'বিকাশ', icon: Wallet },
  { id: 'nagad', name: 'নগদ', icon: QrCode },
  { id: 'rocket', name: 'রকেট', icon: CreditCard },
  { id: 'surecash', name: 'স্যুরক্যাশ', icon: Shield },
  { id: 'upay', name: 'ইউপে', icon: Landmark }
];

const allServices = [
  // CellFin Features
  { 
    id: 1,
    module: 'cellfin',
    title: 'Virtual Prepaid Card', 
    description: 'Instant virtual Visa/Mastercard for online transactions', 
    icon: CreditCard, 
    link: '#virtual-card',
    color: 'blue',
    status: 'active',
    category: 'payment'
  },
  { 
    id: 2,
    module: 'cellfin',
    title: 'Bill Payment', 
    description: 'Pay electricity, gas, water, internet bills', 
    icon: FileText, 
    link: '#bill-payment',
    color: 'green',
    status: 'active',
    category: 'payment'
  },
  { 
    id: 3,
    module: 'cellfin',
    title: 'International Remittance', 
    description: 'Receive money from 26+ countries', 
    icon: Globe, 
    link: '#remittance',
    color: 'purple',
    status: 'active',
    category: 'transfer'
  },
  { 
    id: 4,
    module: 'cellfin',
    title: 'eKYC Onboarding', 
    description: 'Digital identity verification system', 
    icon: UserCheck, 
    link: '#ekyc',
    color: 'orange',
    status: 'active',
    category: 'onboarding'
  },
  { 
    id: 5,
    module: 'cellfin',
    title: 'QR Code Payment', 
    description: 'Scan and pay at merchant outlets', 
    icon: QrCode, 
    link: '#qr-payment',
    color: 'pink',
    status: 'active',
    category: 'payment'
  },

  // bKash Services
  { 
    id: 6,
    module: 'bkash',
    title: 'Cash In/Out', 
    description: 'Agent banking cash deposit and withdrawal', 
    icon: ArrowDownLeft, 
    link: '#cash-in-out',
    color: 'pink',
    status: 'active',
    category: 'transaction'
  },
  { 
    id: 7,
    module: 'bkash',
    title: 'Send Money', 
    description: 'P2P money transfer to any bKash number', 
    icon: Share2, 
    link: '#send-money',
    color: 'pink',
    status: 'active',
    category: 'transfer'
  },
  { 
    id: 8,
    module: 'bkash',
    title: 'Merchant Payment', 
    description: 'Pay at registered merchant outlets', 
    icon: Store, 
    link: '#merchant-payment',
    color: 'pink',
    status: 'active',
    category: 'payment'
  },

  // Nagad Services
  { 
    id: 9,
    module: 'nagad',
    title: 'Cash In/Out', 
    description: 'Nagad agent cash transactions', 
    icon: ArrowDownLeft, 
    link: '#cash-in-out',
    color: 'orange',
    status: 'active',
    category: 'transaction'
  },
  { 
    id: 10,
    module: 'nagad',
    title: 'Send Money', 
    description: 'Transfer to any Nagad account', 
    icon: Share2, 
    link: '#send-money',
    color: 'orange',
    status: 'active',
    category: 'transfer'
  },
  { 
    id: 11,
    module: 'nagad',
    title: 'Bill Payment', 
    description: 'Pay utility and service bills', 
    icon: FileText, 
    link: '#bill-payment',
    color: 'orange',
    status: 'active',
    category: 'payment'
  },

  // Rocket Services
  { 
    id: 12,
    module: 'rocket',
    title: 'Cash In/Out', 
    description: 'Rocket agent banking services', 
    icon: ArrowDownLeft, 
    link: '#cash-in-out',
    color: 'teal',
    status: 'active',
    category: 'transaction'
  },
  { 
    id: 13,
    module: 'rocket',
    title: 'Send Money', 
    description: 'P2P transfer via Rocket', 
    icon: Share2, 
    link: '#send-money',
    color: 'teal',
    status: 'active',
    category: 'transfer'
  },
  { 
    id: 14,
    module: 'rocket',
    title: 'Mobile Recharge', 
    description: 'All operator prepaid/postpaid recharge', 
    icon: Smartphone, 
    link: '#mobile-recharge',
    color: 'teal',
    status: 'active',
    category: 'recharge'
  },

  // SureCash Services
  { 
    id: 15,
    module: 'surecash',
    title: 'Send Money', 
    description: 'Instant money transfer service', 
    icon: Share2, 
    link: '#send-money',
    color: 'red',
    status: 'active',
    category: 'transfer'
  },
  { 
    id: 16,
    module: 'surecash',
    title: 'Bill Payment', 
    description: 'Pay all utility bills', 
    icon: FileText, 
    link: '#bill-payment',
    color: 'red',
    status: 'active',
    category: 'payment'
  },

  // Upay Services
  { 
    id: 17,
    module: 'upay',
    title: 'Send Money', 
    description: 'Transfer to any Upay wallet', 
    icon: Share2, 
    link: '#send-money',
    color: 'indigo',
    status: 'active',
    category: 'transfer'
  },
  { 
    id: 18,
    module: 'upay',
    title: 'Merchant Payment', 
    description: 'Pay at Upay merchant partners', 
    icon: Store, 
    link: '#merchant-payment',
    color: 'indigo',
    status: 'active',
    category: 'payment'
  },
  { 
    id: 19,
    module: 'upay',
    title: 'Cash In/Out', 
    description: 'Agent banking transactions', 
    icon: ArrowDownLeft, 
    link: '#cash-in-out',
    color: 'indigo',
    status: 'active',
    category: 'transaction'
  },

  // Core Banking Features
  { 
    id: 20,
    module: 'all',
    title: 'Agent Dashboard', 
    description: 'Monitor agent performance and stats', 
    icon: Users, 
    link: '#agent-dashboard',
    color: 'blue',
    status: 'active',
    category: 'management'
  },
  { 
    id: 21,
    module: 'all',
    title: 'Commission Management', 
    description: 'Set and track agent commission rules', 
    icon: Percent, 
    link: '#commission',
    color: 'green',
    status: 'active',
    category: 'management'
  },
  { 
    id: 22,
    module: 'all',
    title: 'Daily Settlement', 
    description: 'Process daily agent settlements', 
    icon: Repeat, 
    link: '#settlement',
    color: 'purple',
    status: 'active',
    category: 'settlement'
  },
  { 
    id: 23,
    module: 'all',
    title: 'Reconciliation', 
    description: 'Match system vs provider transactions', 
    icon: ClipboardList, 
    link: '#reconciliation',
    color: 'orange',
    status: 'active',
    category: 'settlement'
  },
  { 
    id: 24,
    module: 'all',
    title: 'Float Balance', 
    description: 'Manage agent float and e-money', 
    icon: Wallet, 
    link: '#float-balance',
    color: 'teal',
    status: 'active',
    category: 'management'
  },
  { 
    id: 25,
    module: 'all',
    title: 'Transaction Limits', 
    description: 'Set min/max/daily/monthly limits', 
    icon: BarChart3, 
    link: '#transaction-limits',
    color: 'red',
    status: 'active',
    category: 'settings'
  },
  { 
    id: 26,
    module: 'all',
    title: 'Transaction Reports', 
    description: 'View detailed transaction analytics', 
    icon: PieChart, 
    link: '#transaction-reports',
    color: 'indigo',
    status: 'active',
    category: 'reports'
  },
  { 
    id: 27,
    module: 'all',
    title: 'Fraud & AML Monitoring', 
    description: 'Detect suspicious transactions', 
    icon: Shield, 
    link: '#fraud-aml',
    color: 'red',
    status: 'active',
    category: 'security'
  },
  { 
    id: 28,
    module: 'all',
    title: 'BB Compliance', 
    description: 'Bangladesh Bank regulatory compliance', 
    icon: Landmark, 
    link: '#bb-compliance',
    color: 'blue',
    status: 'active',
    category: 'compliance'
  },
  { 
    id: 29,
    module: 'all',
    title: 'Agent Onboarding', 
    description: 'KYC verification and approval', 
    icon: UserCheck, 
    link: '#agent-onboarding',
    color: 'green',
    status: 'active',
    category: 'onboarding'
  },
  { 
    id: 30,
    module: 'all',
    title: 'System Settings', 
    description: 'Configure MFS provider settings', 
    icon: Settings, 
    link: '#settings',
    color: 'gray',
    status: 'active',
    category: 'settings'
  }
];

interface ServiceModal {
  isOpen: boolean;
  service: any | null;
}

export default function MfsPage() {
  const [selectedModule, setSelectedModule] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [serviceModal, setServiceModal] = useState<ServiceModal>({ isOpen: false, service: null });
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Agent Onboarded', message: 'Agent ID: AGT-2024-001 has been approved', time: '2 min ago', type: 'success' },
    { id: 2, title: 'Settlement Pending', message: '5 settlements awaiting approval', time: '15 min ago', type: 'warning' },
    { id: 3, title: 'High Transaction Volume', message: 'bKash transactions up 25% today', time: '1 hour ago', type: 'info' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      teal: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
      gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
    };
    return colors[color] || colors.blue;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      payment: CreditCard,
      transfer: Share2,
      transaction: ArrowDownLeft,
      recharge: Smartphone,
      management: Users,
      settlement: Repeat,
      reports: PieChart,
      security: Shield,
      compliance: Landmark,
      onboarding: UserCheck,
      settings: Settings,
    };
    return icons[category] || CreditCard;
  };

  const filteredServices = allServices.filter(service => {
    const matchesModule = selectedModule === 'all' || service.module === selectedModule || selectedModule === service.module;
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModule && matchesCategory && matchesSearch;
  });

  const stats = {
    totalServices: allServices.length,
    activeServices: allServices.filter(s => s.status === 'active').length,
    totalTransactions: '৳৪৫.২M',
    activeAgents: '১,২৫০',
    settlementPending: '৳৩.৮M',
    todayVolume: '৳১২.৫M',
    successRate: '99.8%',
    avgResponseTime: '1.2s'
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: Filter },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'transfer', name: 'Transfer', icon: Share2 },
    { id: 'transaction', name: 'Transaction', icon: ArrowDownLeft },
    { id: 'management', name: 'Management', icon: Users },
    { id: 'settlement', name: 'Settlement', icon: Repeat },
    { id: 'reports', name: 'Reports', icon: PieChart },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const handleServiceClick = (service: any) => {
    setServiceModal({ isOpen: true, service });
  };

  const closeModal = () => {
    setServiceModal({ isOpen: false, service: null });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Fix hydration error - only set time on client side
  useEffect(() => {
    setIsClient(true);
    setLastUpdated(new Date());
    
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header with Actions */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">MFS & CellFin Control Panel</h1>
            <p className="text-gray-600 flex items-center gap-2">
              Manage all {stats.totalServices} mobile financial services
              {isClient && lastUpdated && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(notification => (
                      <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>{stats.activeServices} active</span>
            </p>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span>↑ 12.5%</span> from last month
            </p>
            <p className="text-xs text-gray-500">Today: {stats.todayVolume}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAgents}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span>↑ 8.2%</span> from last month
            </p>
            <p className="text-xs text-gray-500">Success: {stats.successRate}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Settlement Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.settlementPending}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-orange-600">5 settlements awaiting</p>
            <p className="text-xs text-gray-500">Avg: {stats.avgResponseTime}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 border-b pb-4 overflow-x-auto">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = selectedModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedModule(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {m.name}
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredServices.map((service) => {
          const Icon = service.icon;
          const bgClass = getColorClasses(service.color);
          const CategoryIcon = getCategoryIcon(service.category);
          
          return (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className={`bg-gradient-to-r ${bgClass} p-5 rounded-xl border border-gray-200 transition-all hover:shadow-lg hover:scale-105 cursor-pointer group`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white">{service.title}</h3>
                    <CategoryIcon className="w-4 h-4 text-white/60" />
                  </div>
                  <p className="text-sm text-white/80 mt-1">{service.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-white/70 flex items-center gap-1">
                      {service.module === 'all' ? 'Core Feature' : `${service.module.charAt(0).toUpperCase() + service.module.slice(1)}`}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-medium text-white">
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No services found matching your search</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => handleServiceClick(allServices.find(s => s.id === 20) || allServices[0])}
            className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center group"
          >
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Agent Dashboard</p>
          </button>
          <button 
            onClick={() => handleServiceClick(allServices.find(s => s.id === 22) || allServices[0])}
            className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center group"
          >
            <Repeat className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Settlement</p>
          </button>
          <button 
            onClick={() => handleServiceClick(allServices.find(s => s.id === 24) || allServices[0])}
            className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center group"
          >
            <Wallet className="w-6 h-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Float Balance</p>
          </button>
          <button 
            onClick={() => handleServiceClick(allServices.find(s => s.id === 23) || allServices[0])}
            className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors text-center group"
          >
            <ClipboardList className="w-6 h-6 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-700">Reconciliation</p>
          </button>
        </div>
      </div>

      {/* Service Detail Modal */}
      {serviceModal.isOpen && serviceModal.service && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${getColorClasses(serviceModal.service.color)} p-6 rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <serviceModal.service.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{serviceModal.service.title}</h2>
                    <p className="text-sm text-white/80">{serviceModal.service.description}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="text-white/80 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Module</p>
                  <p className="font-semibold text-gray-900">
                    {serviceModal.service.module === 'all' ? 'Core Feature' : serviceModal.service.module.charAt(0).toUpperCase() + serviceModal.service.module.slice(1)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-semibold text-gray-900 capitalize">{serviceModal.service.category}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600 capitalize">{serviceModal.service.status}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Service ID</p>
                  <p className="font-semibold text-gray-900">#{serviceModal.service.id.toString().padStart(4, '0')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Feature Information</h3>
                      <p className="text-sm text-blue-700">
                        This is a fully functional {serviceModal.service.title.toLowerCase()} feature. 
                        All buttons and actions are active and ready to use.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open Feature
                  </button>
                  <button className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}