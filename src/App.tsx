import { useState, useEffect } from 'react';
import { UserRole, User, Project } from './types';
import { mockUsers, mockProjects, mockStats } from './mockData';
import { Layout } from './components/Layout';
import { VisitorHome } from './components/visitor/VisitorHome';
import { VisitorServices } from './components/visitor/VisitorServices';
import { VisitorContact } from './components/visitor/VisitorContact';
import { LoginPage } from './components/auth/LoginPage';
import { ClientDashboard } from './components/client/ClientDashboard';
import { ProjectDetails } from './components/ProjectDetails';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { EmployeeProjectUpdate } from './components/employee/EmployeeProjectUpdate';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagement } from './components/admin/UserManagement';
import { ProjectManagement } from './components/admin/ProjectManagement';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('structura_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [currentPage, setCurrentPage] = useState<string>(() => {
    return localStorage.getItem('structura_page') || 'home';
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Global State
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  // Fetch Users from Backend (Partner 1 Half)
  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setUsers(data);
        }
      })
      .catch(err => console.error("Backend not running yet, using mock users.", err));
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setProjects(data.length > 0 ? data : mockProjects);
        }
      })
      .catch(err => console.error("Backend not running yet, using mock projects.", err));
  }, []);

  const role = currentUser ? currentUser.role : 'visitor';

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('structura_user', JSON.stringify(user));
    setCurrentPage('dashboard');
    localStorage.setItem('structura_page', 'dashboard');
    setSelectedProjectId(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('structura_user');
    setCurrentPage('home');
    localStorage.setItem('structura_page', 'home');
    setSelectedProjectId(null);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await fetch(`http://localhost:5000/api/projects/${updatedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject)
      });
    } catch (e) {
      console.warn("Backend off, updating locally");
    }
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await fetch(`http://localhost:5000/api/projects/${projectId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn("Backend off, deleting locally");
    }
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const handleNavigate = (page: string, projectId?: string) => {
    setCurrentPage(page);
    if (projectId) {
      setSelectedProjectId(projectId);
    } else if (page !== 'project-details') {
      setSelectedProjectId(null);
    }
  };

  const renderContent = () => {
    // Visitor Pages
    if (role === 'visitor') {
      switch (currentPage) {
        case 'home': return <VisitorHome onNavigate={handleNavigate} onLogin={() => setCurrentPage('login')} />;
        case 'services': return <VisitorServices />;
        case 'contact': return <VisitorContact />;
        case 'login': return <LoginPage users={users} onLogin={handleLogin} />;
        default: return <VisitorHome onNavigate={handleNavigate} onLogin={() => setCurrentPage('login')} />;
      }
    }

    // Authenticated Pages
    if (currentPage === 'project-details' && selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        return <ProjectDetails 
                 project={project} 
                 role={role} 
                 onBack={() => setCurrentPage('dashboard')} 
                 onUpdateProject={handleUpdateProject}
                 onDeleteProject={handleDeleteProject}
               />;
      }
    }

    if (currentPage === 'project-update' && selectedProjectId && role === 'employee') {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        return <EmployeeProjectUpdate 
                 project={project} 
                 onBack={() => setCurrentPage('dashboard')} 
                 onUpdateProject={handleUpdateProject} 
               />;
      }
    }

    if (role === 'client') {
      switch (currentPage) {
        case 'dashboard': return <ClientDashboard currentUser={currentUser} projects={projects} onSelectProject={(id) => handleNavigate('project-details', id)} />;
        default: return <ClientDashboard currentUser={currentUser} projects={projects} onSelectProject={(id) => handleNavigate('project-details', id)} />;
      }
    }

    if (role === 'employee') {
      switch (currentPage) {
        case 'dashboard': return <EmployeeDashboard currentUser={currentUser} projects={projects} onSelectProject={(id) => handleNavigate('project-details', id)} onUpdateProject={(id) => handleNavigate('project-update', id)} />;
        default: return <EmployeeDashboard currentUser={currentUser} projects={projects} onSelectProject={(id) => handleNavigate('project-details', id)} onUpdateProject={(id) => handleNavigate('project-update', id)} />;
      }
    }

    if (role === 'admin') {
      switch (currentPage) {
        case 'dashboard': return <AdminDashboard users={users} projects={projects} onNavigate={handleNavigate} />;
        case 'users': return <UserManagement users={users} setUsers={setUsers} />;
        case 'projects': return <ProjectManagement projects={projects} setProjects={setProjects} users={users} onSelectProject={(id) => handleNavigate('project-details', id)} />;
        default: return <AdminDashboard users={users} projects={projects} onNavigate={handleNavigate} />;
      }
    }

    return <div>Page Not Found</div>;
  };

  return (
    <Layout 
      role={role} 
      user={currentUser} 
      currentPage={currentPage}
      projects={projects}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}
