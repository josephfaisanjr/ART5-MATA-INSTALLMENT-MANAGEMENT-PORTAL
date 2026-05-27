import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  User,
  LogOut,
  Calendar,
  TrendingDown,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await Promise.all([fetchPlans(session.access_token), fetchProfile(session.access_token)]);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/plans/my-plans`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.log('Error fetching plans:', error);
    }
  };

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/auth/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('Logout successful');
      }
      onLogout();
    } catch (error) {
      console.error('Logout exception:', error);
      onLogout();
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'plans', icon: FileText, label: 'My Plans' },
    { id: 'payments', icon: CreditCard, label: 'Payment History' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const activePlan = plans.find(p => p.paymentStatus !== 'paid') || plans[0];
  const completionPercentage = activePlan
    ? ((activePlan.totalAmount - activePlan.remainingBalance) / activePlan.totalAmount) * 100
    : 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#2563EB] to-[#4F46E5] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold">ART5MATA</h1>
          <p className="text-sm text-white/80">Customer Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-white text-[#2563EB] shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 p-3 bg-white/10 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.firstName && profile?.lastName
                  ? `${profile.firstName} ${profile.middleName || ''} ${profile.lastName}`.trim()
                  : user.email}
              </p>
              <p className="text-xs text-white/60">Customer</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {menuItems.find(item => item.id === activeTab)?.label}
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              plans={plans}
              activePlan={activePlan}
              completionPercentage={completionPercentage}
            />
          )}

          {activeTab === 'plans' && (
            <PlansTab plans={plans} />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab plans={plans} />
          )}

          {activeTab === 'profile' && (
            <ProfileTab profile={profile} user={user} />
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardOverview({ plans, activePlan, completionPercentage }: any) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-8 w-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{plans.length}</div>
          <div className="text-sm opacity-90">Active Plans</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">
            ₱{activePlan ? (activePlan.totalAmount - activePlan.remainingBalance).toLocaleString() : 0}
          </div>
          <div className="text-sm opacity-90">Total Paid</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="h-8 w-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">
            ₱{activePlan ? activePlan.remainingBalance.toLocaleString() : 0}
          </div>
          <div className="text-sm opacity-90">Remaining Balance</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {activePlan ? new Date(activePlan.dueDate || activePlan.startDate).toLocaleDateString('en-PH') : 'N/A'}
          </div>
          <div className="text-sm opacity-90">Next Due Date</div>
        </motion.div>
      </div>

      {/* Active Plan Details */}
      {activePlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Active Funeral Plan</h3>
              <p className="text-sm text-gray-600">{activePlan.packageType}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              activePlan.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
              activePlan.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {activePlan.paymentStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Plan Number</p>
              <p className="text-lg font-semibold text-gray-900">{activePlan.planNumber}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-lg font-semibold text-gray-900">₱{activePlan.totalAmount.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Monthly Installment</p>
              <p className="text-lg font-semibold text-gray-900">₱{activePlan.monthlyInstallment?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Payment Progress</p>
              <p className="text-sm font-semibold text-blue-600">{completionPercentage.toFixed(1)}%</p>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
              <span>₱{(activePlan.totalAmount - activePlan.remainingBalance).toLocaleString()} paid</span>
              <span>₱{activePlan.remainingBalance.toLocaleString()} remaining</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment Timeline */}
      {activePlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Payment Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Down Payment</p>
                <p className="text-sm text-gray-600">{activePlan.startDate}</p>
              </div>
              <p className="text-lg font-semibold text-green-600">₱{activePlan.downPayment?.toLocaleString()}</p>
            </div>

            {activePlan.remainingBalance > 0 && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Next Payment Due</p>
                  <p className="text-sm text-gray-600">Monthly installment</p>
                </div>
                <p className="text-lg font-semibold text-blue-600">₱{activePlan.monthlyInstallment?.toLocaleString()}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {plans.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plans Yet</h3>
          <p className="text-gray-600">You don't have any funeral plans assigned yet.</p>
        </div>
      )}
    </div>
  );
}

function PlansTab({ plans }: any) {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan: any, index: number) => {
          const paymentProgress = ((plan.totalAmount - plan.remainingBalance) / plan.totalAmount) * 100;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer transition-shadow"
              onClick={() => setSelectedPlan(plan)}
            >
              {/* Card Header with Gradient */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.packageType}</h3>
                    <p className="text-sm text-gray-600">Plan #{plan.planNumber}</p>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                    plan.paymentStatus === 'paid' ? 'bg-green-500 text-white' :
                    plan.paymentStatus === 'partial' || plan.paymentStatus === 'active' ? 'bg-yellow-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {plan.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Payment Progress</span>
                    <span className="text-lg font-bold text-blue-600">{paymentProgress.toFixed(0)}%</span>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${paymentProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 + 0.3 }}
                      className={`h-full relative ${
                        paymentProgress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                        paymentProgress > 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                        'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}
                    >
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-gray-900">₱{plan.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Paid</p>
                    <p className="text-lg font-bold text-green-600">
                      ₱{(plan.totalAmount - plan.remainingBalance).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Balance</p>
                    <p className="text-lg font-bold text-orange-600">₱{plan.remainingBalance.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Monthly</p>
                    <p className="text-lg font-bold text-blue-600">₱{plan.monthlyInstallment?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Services Badge */}
                {plan.servicesIncluded && plan.servicesIncluded.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-2">Services Included</p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.servicesIncluded.slice(0, 3).map((service: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded">
                          {service}
                        </span>
                      ))}
                      {plan.servicesIncluded.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          +{plan.servicesIncluded.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 flex items-center justify-between text-sm">
                <span className="text-gray-600">Click for details</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          );
        })}
      </div>

      {plans.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plans Yet</h3>
          <p className="text-gray-600">You don't have any funeral plans assigned yet.</p>
        </motion.div>
      )}

      {selectedPlan && (
        <PlanDetailModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}

function PlanDetailModal({ plan, onClose }: any) {
  const paymentProgress = ((plan.totalAmount - plan.remainingBalance) / plan.totalAmount) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 p-6 border-b bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white rounded-t-xl z-10">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">{plan.packageType}</h3>
              <p className="text-white/80">Plan #{plan.planNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Payment Progress</h4>
              <span className="text-lg font-bold text-blue-600">{paymentProgress.toFixed(1)}%</span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${paymentProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full relative ${
                  paymentProgress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                  paymentProgress > 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                  'bg-gradient-to-r from-orange-500 to-red-500'
                }`}
              >
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </motion.div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">₱{plan.totalAmount?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ₱{(plan.totalAmount - plan.remainingBalance)?.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Balance</p>
              <p className="text-2xl font-bold text-orange-600">₱{plan.remainingBalance?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Monthly</p>
              <p className="text-2xl font-bold text-purple-600">₱{plan.monthlyInstallment?.toLocaleString()}</p>
            </div>
          </div>

          {/* Plan Details */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                plan.paymentStatus === 'paid' ? 'bg-green-500 text-white' :
                plan.paymentStatus === 'partial' || plan.paymentStatus === 'active' ? 'bg-yellow-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                {plan.paymentStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="font-medium">{plan.duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Down Payment</span>
              <span className="font-medium">₱{plan.downPayment?.toLocaleString()}</span>
            </div>
            {plan.startDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Start Date</span>
                <span className="font-medium">
                  {new Date(plan.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Services Included */}
          {plan.servicesIncluded && plan.servicesIncluded.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Services Included</h4>
              <div className="grid grid-cols-1 gap-2">
                {plan.servicesIncluded.map((service: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{service}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {plan.notes && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes</p>
              <p className="text-sm text-gray-600">{plan.notes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function PaymentsTab({ plans }: any) {
  const paymentHistory = plans.map((plan: any) => ({
    plan: plan.packageType,
    planNumber: plan.planNumber,
    totalPaid: plan.totalAmount - plan.remainingBalance,
    remaining: plan.remainingBalance,
    status: plan.paymentStatus
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Payment Summary</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paymentHistory.map((payment: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{payment.plan}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{payment.planNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                  ₱{payment.totalPaid.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-orange-600 font-semibold">
                  ₱{payment.remaining.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                    payment.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProfileTab({ profile, user }: any) {
  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">First Name</label>
                <p className="text-lg font-medium">{profile?.firstName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Middle Name</label>
                <p className="text-lg font-medium">{profile?.middleName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Last Name</label>
                <p className="text-lg font-medium">{profile?.lastName || 'N/A'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Email Address</label>
              <p className="text-lg font-medium">{user.email}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">Mobile Number</label>
              <p className="text-lg font-medium">{profile?.mobileNumber || 'N/A'}</p>
            </div>

            {profile?.address && (
              <div>
                <label className="text-sm text-gray-600">Address</label>
                <p className="text-lg font-medium">
                  {profile.address.houseNo && `${profile.address.houseNo} `}
                  {profile.address.street && `${profile.address.street}, `}
                  {profile.address.barangay && `${profile.address.barangay}, `}
                  {profile.address.city && `${profile.address.city}, `}
                  {profile.address.province}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
