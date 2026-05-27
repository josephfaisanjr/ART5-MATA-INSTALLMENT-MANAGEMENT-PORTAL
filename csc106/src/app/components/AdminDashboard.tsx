import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  UserCheck,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [plans, setPlans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
        await Promise.all([
          fetchPlans(session.access_token),
          fetchCustomers(session.access_token),
          fetchAdmins(session.access_token)
        ]);
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
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/plans/all`,
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

  const fetchCustomers = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/customers/all`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        const users = (data.customers || []).filter((c: any) => c.role === 'user');
        setCustomers(users);
      }
    } catch (error) {
      console.log('Error fetching customers:', error);
    }
  };

  const fetchAdmins = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/admins/all`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.log('Error fetching admins:', error);
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
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'admins', icon: UserCheck, label: 'Admins' },
    { id: 'plans', icon: FileText, label: 'Funeral Plans' },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const stats = {
    totalCustomers: customers.length,
    activePlans: plans.filter((p: any) => p.paymentStatus === 'active' || p.paymentStatus === 'partial').length,
    totalRevenue: plans.reduce((sum: number, p: any) => sum + (p.totalAmount - p.remainingBalance), 0),
    pendingPayments: plans.filter((p: any) => p.paymentStatus === 'pending' || p.paymentStatus === 'overdue').length,
    fullyPaid: plans.filter((p: any) => p.paymentStatus === 'paid').length,
  };

  const filteredPlans = plans.filter((plan: any) =>
    plan.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.planNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#2563EB] to-[#4F46E5] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold">ART5MATA</h1>
          <p className="text-sm text-white/80">Admin Panel</p>
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
              <Users className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-white/60">Administrator</p>
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
            <DashboardOverview stats={stats} plans={plans} />
          )}

          {activeTab === 'users' && (
            <UsersTab users={customers} accessToken={accessToken} onRefresh={() => fetchCustomers(accessToken)} />
          )}

          {activeTab === 'admins' && (
            <AdminsTab admins={admins} accessToken={accessToken} onRefresh={() => fetchAdmins(accessToken)} />
          )}

          {activeTab === 'plans' && (
            <PlansTab
              plans={filteredPlans}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onCreateNew={() => setShowCreateModal(true)}
              onRefresh={() => fetchPlans(accessToken)}
              accessToken={accessToken}
              customers={customers}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab plans={plans} />
          )}

          {activeTab === 'reports' && (
            <ReportsTab stats={stats} plans={plans} />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab />
          )}

          {activeTab === 'settings' && (
            <SettingsTab user={user} accessToken={accessToken} />
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreatePlanModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchPlans(accessToken);
            setShowCreateModal(false);
          }}
          accessToken={accessToken}
          customers={customers}
        />
      )}
    </div>
  );
}

function DashboardOverview({ stats, plans }: any) {
  const statCards = [
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Plans', value: stats.activePlans, icon: FileText, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Total Revenue', value: `₱${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'from-orange-500 to-orange-600' },
    { label: 'Fully Paid', value: stats.fullyPaid, icon: UserCheck, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="h-8 w-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm opacity-90">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Plans</h3>
        <div className="space-y-3">
          {plans.slice(0, 5).map((plan: any) => (
            <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{plan.customerName}</p>
                <p className="text-sm text-gray-600">{plan.packageType}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">₱{plan.totalAmount.toLocaleString()}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  plan.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  plan.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {plan.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsersTab({ users, accessToken, onRefresh }: any) {
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`⚠️ WARNING: Are you sure you want to deactivate ${userName}?\n\nThis will PERMANENTLY:\n• Delete their account\n• Remove all their funeral plans\n• Delete all payment records\n• Remove them from the system\n\nThis action CANNOT be undone!`)) return;

    setDeactivating(userId);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        onRefresh();
      } else {
        const data = await response.json();
        alert(`Failed to deactivate user: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log('Error deleting user:', error);
      alert('Failed to deactivate user');
    } finally {
      setDeactivating(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">User Management</h3>
        <p className="text-sm text-gray-600 mt-1">Manage customer accounts and access</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user: any) => {
              const fullName = `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim();
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.mobileNumber || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteUser(user.id, fullName)}
                      disabled={deactivating === user.id}
                      className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deactivating === user.id ? (
                        <>
                          <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          Deactivating...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Deactivate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminsTab({ admins, accessToken, onRefresh }: any) {
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (!confirm(`⚠️ WARNING: Are you sure you want to deactivate admin ${adminName}?\n\nThis will PERMANENTLY:\n• Delete their admin account\n• Remove all their funeral plans\n• Delete all payment records\n• Remove them from the system\n\nThis action CANNOT be undone!`)) return;

    setDeactivating(adminId);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/users/${adminId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        onRefresh();
      } else {
        const data = await response.json();
        alert(`Failed to deactivate admin: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log('Error deleting admin:', error);
      alert('Failed to deactivate admin');
    } finally {
      setDeactivating(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Administrator Management</h3>
        <p className="text-sm text-gray-600 mt-1">Manage admin accounts and permissions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {admins.map((admin: any) => {
              const fullName = `${admin.firstName || ''} ${admin.middleName || ''} ${admin.lastName || ''}`.trim();
              return (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {fullName}
                    <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">Admin</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{admin.mobileNumber || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteAdmin(admin.id, fullName)}
                      disabled={deactivating === admin.id}
                      className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deactivating === admin.id ? (
                        <>
                          <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          Deactivating...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Deactivate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const notifications = [
    { id: 1, type: 'payment', title: 'Payment Received', message: 'Juan dela Cruz paid ₱5,000 for plan ART5-12345', time: '2 hours ago', read: false },
    { id: 2, type: 'plan', title: 'New Plan Created', message: 'New funeral plan created for Maria Santos', time: '5 hours ago', read: false },
    { id: 3, type: 'overdue', title: 'Payment Overdue', message: 'Plan ART5-67890 payment is 3 days overdue', time: '1 day ago', read: true },
    { id: 4, type: 'user', title: 'New User Registered', message: 'Pedro Reyes created a new account', time: '2 days ago', read: true },
  ];

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <p className="text-sm text-gray-600 mt-1">Recent system activities and alerts</p>
        </div>
        <div className="divide-y">
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-6 hover:bg-gray-50 transition cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notif.type === 'payment' ? 'bg-green-100' :
                  notif.type === 'plan' ? 'bg-blue-100' :
                  notif.type === 'overdue' ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  {notif.type === 'payment' && <DollarSign className="h-5 w-5 text-green-600" />}
                  {notif.type === 'plan' && <FileText className="h-5 w-5 text-blue-600" />}
                  {notif.type === 'overdue' && <Clock className="h-5 w-5 text-red-600" />}
                  {notif.type === 'user' && <Users className="h-5 w-5 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{notif.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ user, accessToken }: any) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    paymentReminders: true,
    systemUpdates: true,
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900 mt-1">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <p className="text-gray-900 mt-1">Administrator</p>
          </div>
          <div className="pt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Change Password
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive email updates about system activities</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-600">Receive SMS alerts for important events</p>
            </div>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Payment Reminders</p>
              <p className="text-sm text-gray-600">Get notified about upcoming payment dues</p>
            </div>
            <input
              type="checkbox"
              checked={settings.paymentReminders}
              onChange={(e) => setSettings({ ...settings, paymentReminders: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">System Updates</p>
              <p className="text-sm text-gray-600">Receive notifications about system maintenance</p>
            </div>
            <input
              type="checkbox"
              checked={settings.systemUpdates}
              onChange={(e) => setSettings({ ...settings, systemUpdates: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </div>
        </div>
        <div className="mt-6 pt-6 border-t">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Save Preferences
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-medium">May 27, 2026</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Database Status</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlansTab({ plans, searchTerm, setSearchTerm, onCreateNew, onRefresh, accessToken, customers }: any) {
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [viewingPlan, setViewingPlan] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/plans/${planId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.log('Error deleting plan:', error);
    }
  };

  const filteredPlans = plans.filter((plan: any) => {
    const matchesStatus = statusFilter === 'all' || plan.paymentStatus === statusFilter;
    const matchesPackage = packageFilter === 'all' || plan.packageType === packageFilter;
    return matchesStatus && matchesPackage;
  });

  const uniquePackages = [...new Set(plans.map((p: any) => p.packageType))];

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name or plan number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
                showFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white px-4 py-2 rounded-lg hover:from-[#1e40af] hover:to-[#4338ca] transition shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Create New Plan
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="active">Active</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
                <select
                  value={packageFilter}
                  onChange={(e) => setPackageFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Packages</option>
                  {uniquePackages.map((pkg: any) => (
                    <option key={pkg} value={pkg}>{pkg}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setPackageFilter('all');
                  }}
                  className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Plan Cards with Payment Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlans.map((plan: any) => {
          const paymentProgress = ((plan.totalAmount - plan.remainingBalance) / plan.totalAmount) * 100;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer transition-shadow"
              onClick={() => setViewingPlan(plan)}
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">{plan.customerName}</h4>
                    <p className="text-sm text-gray-500">{plan.planNumber}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    plan.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    plan.paymentStatus === 'partial' || plan.paymentStatus === 'active' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {plan.paymentStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{plan.packageType}</p>
              </div>

              {/* Payment Progress */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Payment Progress</span>
                    <span className="text-sm font-semibold text-blue-600">{paymentProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${paymentProgress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        paymentProgress === 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        paymentProgress > 50 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        'bg-gradient-to-r from-orange-500 to-orange-600'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="font-semibold text-gray-900">₱{plan.totalAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Balance</p>
                    <p className="font-semibold text-orange-600">₱{plan.remainingBalance?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Paid</p>
                    <p className="font-semibold text-green-600">₱{(plan.totalAmount - plan.remainingBalance)?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Monthly</p>
                    <p className="font-semibold text-gray-900">₱{plan.monthlyInstallment?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-6 py-3 bg-gray-50 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPlan(plan);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(plan.id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No plans found matching your filters</p>
        </div>
      )}

      {viewingPlan && (
        <PlanDetailsModal
          plan={viewingPlan}
          onClose={() => setViewingPlan(null)}
          accessToken={accessToken}
        />
      )}

      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSuccess={() => {
            onRefresh();
            setEditingPlan(null);
          }}
          accessToken={accessToken}
          customers={customers}
        />
      )}
    </div>
  );
}

function PaymentsTab({ plans }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Payment Records</h3>
      <div className="space-y-3">
        {plans.map((plan: any) => (
          <div key={plan.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{plan.customerName}</p>
                <p className="text-sm text-gray-600">{plan.packageType}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Paid: ₱{(plan.totalAmount - plan.remainingBalance).toLocaleString()}</p>
                <p className="text-sm text-orange-600">Balance: ₱{plan.remainingBalance?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsTab({ stats, plans }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600">₱{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Collected</p>
            <p className="text-2xl font-bold text-green-600">
              ₱{plans.reduce((sum: number, p: any) => sum + (p.totalAmount - p.remainingBalance), 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="text-2xl font-bold text-orange-600">
              ₱{plans.reduce((sum: number, p: any) => sum + p.remainingBalance, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanDetailsModal({ plan, onClose, accessToken }: any) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/payments/${plan.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.log('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const paymentProgress = ((plan.totalAmount - plan.remainingBalance) / plan.totalAmount) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8"
      >
        <div className="p-6 border-b bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white rounded-t-xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">{plan.customerName}</h3>
              <p className="text-white/80">{plan.planNumber}</p>
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
          {/* Plan Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Amount</p>
              <p className="text-xl font-bold text-blue-600">₱{plan.totalAmount?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Paid</p>
              <p className="text-xl font-bold text-green-600">₱{(plan.totalAmount - plan.remainingBalance)?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Balance</p>
              <p className="text-xl font-bold text-orange-600">₱{plan.remainingBalance?.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Monthly</p>
              <p className="text-xl font-bold text-purple-600">₱{plan.monthlyInstallment?.toLocaleString()}</p>
            </div>
          </div>

          {/* Payment Progress Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Payment Progress</h4>
              <span className="text-sm font-semibold text-blue-600">{paymentProgress.toFixed(1)}%</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${paymentProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full relative ${
                    paymentProgress === 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    paymentProgress > 50 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    'bg-gradient-to-r from-orange-500 to-orange-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Package Type</p>
              <p className="font-medium">{plan.packageType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                plan.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                plan.paymentStatus === 'partial' || plan.paymentStatus === 'active' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {plan.paymentStatus}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium">{plan.duration}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Down Payment</p>
              <p className="font-medium">₱{plan.downPayment?.toLocaleString()}</p>
            </div>
          </div>

          {/* Payment Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Payment History</h4>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                Add Payment
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {payments.sort((a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).map((payment: any, index: number) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">₱{payment.amount?.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 capitalize">{payment.paymentMethod || 'Cash'}</p>
                      {payment.notes && <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No payment records yet</p>
              </div>
            )}
          </div>

          {plan.notes && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
              <p className="text-sm text-gray-600">{plan.notes}</p>
            </div>
          )}
        </div>

        {showPaymentModal && (
          <AddPaymentModal
            plan={plan}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={() => {
              fetchPayments();
              setShowPaymentModal(false);
            }}
            accessToken={accessToken}
          />
        )}
      </motion.div>
    </div>
  );
}

function AddPaymentModal({ plan, onClose, onSuccess, accessToken }: any) {
  const [formData, setFormData] = useState({
    amount: plan.monthlyInstallment || 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/payments/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            planId: plan.id,
            ...formData
          })
        }
      );

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.log('Error adding payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
      >
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">Add Payment</h3>
          <p className="text-sm text-gray-600 mt-1">{plan.customerName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (₱) *</label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Date *</label>
            <input
              type="date"
              required
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method *</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white rounded-lg hover:from-[#1e40af] hover:to-[#4338ca] disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function CreatePlanModal({ onClose, onSuccess, accessToken, customers }: any) {
  const [formData, setFormData] = useState({
    customerName: '',
    assignedUserId: '',
    contactNumber: '',
    address: '',
    packageType: 'Basic Memorial Plan',
    totalAmount: 0,
    downPayment: 0,
    monthlyInstallment: 0,
    duration: '12 months',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/plans/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.log('Error creating plan:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b sticky top-0 bg-white">
          <h3 className="text-xl font-bold">Create Funeral Plan</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assign to User</label>
              <select
                value={formData.assignedUserId}
                onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select User</option>
                {customers.filter((c: any) => c.role === 'user').map((customer: any) => {
                  const fullName = `${customer.firstName || ''} ${customer.middleName || ''} ${customer.lastName || ''}`.trim();
                  return <option key={customer.id} value={customer.id}>{fullName}</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Number</label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Package Type *</label>
              <select
                required
                value={formData.packageType}
                onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option>Basic Memorial Plan</option>
                <option>Standard Funeral Plan</option>
                <option>Cremation Plan</option>
                <option>Family Memorial Plan</option>
                <option>Eternal Care Plan</option>
                <option>Senior Citizen Memorial Plan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Amount (₱) *</label>
              <input
                type="number"
                required
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Down Payment (₱)</label>
              <input
                type="number"
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Monthly Installment (₱)</label>
              <input
                type="number"
                value={formData.monthlyInstallment}
                onChange={(e) => setFormData({ ...formData, monthlyInstallment: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white rounded-lg hover:from-[#1e40af] hover:to-[#4338ca]"
            >
              Create Plan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function EditPlanModal({ plan, onClose, onSuccess, accessToken, customers }: any) {
  const [formData, setFormData] = useState({
    customerName: plan.customerName,
    packageType: plan.packageType,
    totalAmount: plan.totalAmount,
    downPayment: plan.downPayment,
    monthlyInstallment: plan.monthlyInstallment,
    paymentStatus: plan.paymentStatus,
    notes: plan.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4b37e4c/plans/${plan.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.log('Error updating plan:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
      >
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">Edit Funeral Plan</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="active">Active</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Amount (₱)</label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Down Payment (₱)</label>
              <input
                type="number"
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white rounded-lg hover:from-[#1e40af] hover:to-[#4338ca]"
            >
              Update Plan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
