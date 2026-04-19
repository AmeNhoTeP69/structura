import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  ShieldCheck, 
  Construction, 
  Mail,
  User as UserIcon,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { UserRole, User, Project } from '../types';
import { useState, useRef, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
  role: UserRole;
  user: User | null;
  currentPage: string;
  projects?: Project[];
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Layout({ children, role, user, currentPage, projects = [], onNavigate, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Extract recent updates for client
  const clientProjects = role === 'client' && user ? projects.filter(p => p.clientId === user.id) : [];
  const allUpdates = clientProjects.flatMap(p => p.updates.map(u => ({ ...u, projectName: p.title }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const navigation = {
    visitor: [
      { name: 'Home', icon: Home, id: 'home' },
      { name: 'Services', icon: Construction, id: 'services' },
      { name: 'Contact', icon: Mail, id: 'contact' },
      { name: 'Login', icon: UserIcon, id: 'login' },
    ],
    client: [
      { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    ],
    employee: [
      { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    ],
    admin: [
      { name: 'Admin Hub', icon: ShieldCheck, id: 'dashboard' },
      { name: 'Team Management', icon: Users, id: 'users' },
      { name: 'Project Control', icon: Briefcase, id: 'projects' },
    ],
  };

  const currentNav = navigation[role];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-slate-200 flex flex-col z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Structura</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {currentNav.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>



        {user && (
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-medium">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
              </div>
              <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-1.5 w-64">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {role === 'client' && (
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`p-2 rounded-lg relative transition-colors ${isNotificationsOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <Bell size={20} />
                  {allUpdates.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                
                {isNotificationsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Recent Project Updates</h4>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {allUpdates.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">No updates yet.</div>
                      ) : (
                        allUpdates.map((update, idx) => (
                          <div key={idx} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{update.projectName}</span>
                              <span className="text-[10px] font-medium text-slate-400">{update.date}</span>
                            </div>
                            <p className="text-sm text-slate-700 font-medium">{update.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-tight">
                {role !== 'visitor' && `${role} / `}{currentPage.replace('-', ' ')}
              </span>
              <ChevronRight size={14} className="text-slate-300" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
