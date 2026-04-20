import { useState, useEffect } from 'react';
import { UserRole, User, Project, ProjectRequest } from './types';
import { mockUsers, mockProjects } from './mockData';
import { Layout } from './components/Layout';
import { VisitorHome } from './components/visitor/VisitorHome';
import { VisitorServices } from './components/visitor/VisitorServices';
import { VisitorContact } from './components/visitor/VisitorContact';
import { VisitorServiceDetails } from './components/visitor/VisitorServiceDetails';
import { ProjectBasketPage } from './components/ProjectBasketPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ProfilePage } from './components/auth/ProfilePage';
import { ClientDashboard } from './components/client/ClientDashboard';
import { CreateProjectRequestPage } from './components/client/CreateProjectRequestPage';
import { ProjectRequestsPage } from './components/client/ProjectRequestsPage';
import { ProjectRequestDetailsPage } from './components/client/ProjectRequestDetailsPage';
import { ProjectDetails } from './components/ProjectDetails';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { EmployeeProjectUpdate } from './components/employee/EmployeeProjectUpdate';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProjectRequestsPage } from './components/admin/AdminProjectRequestsPage';
import { AdminProjectRequestDetailsPage } from './components/admin/AdminProjectRequestDetailsPage';
import { UserManagement } from './components/admin/UserManagement';
import { ProjectManagement } from './components/admin/ProjectManagement';
import { clearAuthToken, clearStoredUser, getAuthHeaders, getAuthToken, getStoredUser, setAuthToken, setStoredUser } from './lib/auth';
import { addServiceToProjectBasket, clearProjectBasket, getProjectBasket, removeServiceFromProjectBasket } from './lib/project-basket';
import { PublicService } from './types/public';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      return getStoredUser<User>();
    } catch { return null; }
  });
  const [currentPage, setCurrentPage] = useState<string>(() => {
    return localStorage.getItem('structura_page') || 'home';
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedProjectRequestId, setSelectedProjectRequestId] = useState<string | null>(null);
  const [isAuthBootstrapped, setIsAuthBootstrapped] = useState(false);

  // Global State
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
  const [projectBasket, setProjectBasket] = useState<PublicService[]>(() => getProjectBasket());

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      return;
    }

    fetch('http://localhost:5001/api/users', {
      headers: getAuthHeaders(),
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to load users');
        return res.json();
      })
      .then(payload => {
        const data = payload?.data;
        if (data && data.length > 0) {
          setUsers(data);
        }
      })
      .catch(err => console.error("Could not load users from backend.", err));
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    fetch('http://localhost:5001/api/projects', {
      headers: getAuthHeaders(),
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to load projects');
        return res.json();
      })
      .then(payload => {
        const data = payload?.data;
        if (data) {
          setProjects(data.length > 0 ? data : mockProjects);
        }
      })
      .catch(err => console.error("Could not load projects from backend.", err));
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !['client', 'admin'].includes(currentUser.role)) {
      setProjectRequests([]);
      return;
    }

    const url =
      currentUser.role === 'admin'
        ? 'http://localhost:5001/api/admin/project-requests'
        : 'http://localhost:5001/api/project-requests/mine';

    fetch(url, {
      headers: getAuthHeaders(),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load project requests');
        return res.json();
      })
      .then((payload) => {
        setProjectRequests(payload?.data || []);
      })
      .catch((error) => {
        console.error('Could not load project requests from backend.', error);
      });
  }, [currentUser]);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setIsAuthBootstrapped(true);
      return;
    }

    fetch('http://localhost:5001/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Session expired');
        }

        const payload = await res.json();
        const user = payload?.data as User | undefined;

        if (user) {
          setCurrentUser(user);
          setStoredUser(user);
        }
      })
      .catch(() => {
        clearAuthToken();
        clearStoredUser();
        setCurrentUser(null);
      })
      .finally(() => {
        setIsAuthBootstrapped(true);
      });
  }, []);

  const role = currentUser ? currentUser.role : 'visitor';

  const handleUserUpdated = (user: User) => {
    setCurrentUser(user);
    setStoredUser(user);
    setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, ...user } : item)));
  };

  const handleLogin = (user: User, token?: string) => {
    setCurrentUser(user);
    setStoredUser(user);
    if (token) {
      setAuthToken(token);
    }
    setCurrentPage('dashboard');
    localStorage.setItem('structura_page', 'dashboard');
    setSelectedProjectId(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearAuthToken();
    clearStoredUser();
    setCurrentPage('home');
    localStorage.setItem('structura_page', 'home');
    setSelectedProjectId(null);
    setSelectedProjectRequestId(null);
  };

  const handleAddServiceToBasket = (service: PublicService) => {
    setProjectBasket(addServiceToProjectBasket(service));
  };

  const handleRemoveServiceFromBasket = (serviceId: string) => {
    setProjectBasket(removeServiceFromProjectBasket(serviceId));
  };

  const handleClearBasket = () => {
    clearProjectBasket();
    setProjectBasket([]);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await fetch(`http://localhost:5001/api/projects/${updatedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(updatedProject)
      });
    } catch (e) {
      console.warn("Backend off, updating locally");
    }
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await fetch(`http://localhost:5001/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
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

    if (page !== 'service-details') {
      setSelectedServiceId(null);
    }

    if (page !== 'request-details') {
      setSelectedProjectRequestId(null);
    }
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setCurrentPage('service-details');
  };

  const handleSelectProjectRequest = (requestId: string) => {
    setSelectedProjectRequestId(requestId);
    setCurrentPage('request-details');
  };

  const handleCreateProjectRequest = async (payload: {
    title: string;
    description: string;
    location: string;
    requestedStartDate: string;
    requestedBudget: string;
    services: { serviceId: string; quantity: number; notes?: string }[];
    documents: { documentType: string; fileName: string; mimeType?: string; fileSize?: number }[];
    status: 'draft' | 'submitted';
  }) => {
    const createResponse = await fetch('http://localhost:5001/api/project-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        ...payload,
        status: payload.status === 'submitted' ? 'draft' : payload.status,
      }),
    });

    const createPayload = await createResponse.json().catch(() => null);

    if (!createResponse.ok) {
      throw new Error(createPayload?.error?.message || 'Unable to create project request.');
    }

    let projectRequest = createPayload?.data as ProjectRequest;

    if (payload.status === 'submitted') {
      const submitResponse = await fetch(
        `http://localhost:5001/api/project-requests/${projectRequest.id}/submit`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        },
      );
      const submitPayload = await submitResponse.json().catch(() => null);

      if (!submitResponse.ok) {
        throw new Error(submitPayload?.error?.message || 'Unable to submit project request.');
      }

      projectRequest = submitPayload?.data as ProjectRequest;
    }

    setProjectRequests((prev) => [projectRequest, ...prev]);
    handleClearBasket();
    setSelectedProjectRequestId(projectRequest.id);
    setCurrentPage('request-details');
  };

  const handleRespondToProjectRequest = async (
    requestId: string,
    action: 'accept' | 'refuse',
    note?: string,
  ) => {
    const response = await fetch(`http://localhost:5001/api/project-requests/${requestId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        action,
        note,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error?.message || 'Unable to update project request.');
    }

    const nextRequest = payload?.data as ProjectRequest;
    setProjectRequests((prev) =>
      prev.map((item) => (item.id === nextRequest.id ? nextRequest : item)),
    );
  };

  const handleAdminUpdateProjectRequest = async (
    requestId: string,
    updates: {
      status: string;
      adminProposedStartDate: string;
      adminProposedBudget: string;
      adminReviewNote: string;
      historyComment?: string;
    },
  ) => {
    const response = await fetch(`http://localhost:5001/api/admin/project-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updates),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error?.message || 'Unable to update project request.');
    }

    const nextRequest = payload?.data as ProjectRequest;
    setProjectRequests((prev) =>
      prev.map((item) => (item.id === nextRequest.id ? nextRequest : item)),
    );
  };

  const handleTransitionProjectRequestToProject = async (requestId: string) => {
    const response = await fetch(
      `http://localhost:5001/api/project-requests/${requestId}/transition-to-project`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      },
    );

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error?.message || 'Unable to create project from request.');
    }

    const project = payload?.data as Project;
    setProjects((prev) => [project, ...prev.filter((item) => item.id !== project.id)]);
    setProjectRequests((prev) =>
      prev.map((item) =>
        item.id === requestId ? { ...item, projectId: project.id, status: 'approved' } : item,
      ),
    );
    setSelectedProjectId(project.id);
    setCurrentPage('projects');
  };

  const renderContent = () => {
    if (!isAuthBootstrapped) {
      return <div className="py-12 text-center text-slate-500 font-medium">Loading session...</div>;
    }

    // Visitor Pages
    if (role === 'visitor') {
      switch (currentPage) {
        case 'home': return <VisitorHome onNavigate={handleNavigate} onLogin={() => setCurrentPage('login')} />;
        case 'services':
          return (
            <VisitorServices
              onSelectService={handleSelectService}
              onAddService={handleAddServiceToBasket}
            />
          );
        case 'basket':
          return (
            <ProjectBasketPage
              services={projectBasket}
              isAuthenticated={false}
              onBrowseServices={() => setCurrentPage('services')}
              onProceed={() => setCurrentPage('login')}
              onRemoveService={handleRemoveServiceFromBasket}
              onClearBasket={handleClearBasket}
            />
          );
        case 'service-details':
          return selectedServiceId ? (
            <VisitorServiceDetails
              serviceId={selectedServiceId}
              onBack={() => setCurrentPage('services')}
              onContact={() => setCurrentPage('contact')}
              onAddService={handleAddServiceToBasket}
            />
          ) : (
            <VisitorServices
              onSelectService={handleSelectService}
              onAddService={handleAddServiceToBasket}
            />
          );
        case 'contact': return <VisitorContact />;
        case 'login': return <LoginPage onLogin={handleLogin} onShowRegister={() => setCurrentPage('register')} />;
        case 'register': return <RegisterPage onRegister={handleLogin} onBackToLogin={() => setCurrentPage('login')} />;
        default: return <VisitorHome onNavigate={handleNavigate} onLogin={() => setCurrentPage('login')} />;
      }
    }

    // Authenticated Pages
    if (currentPage === 'project-details' && selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        return <ProjectDetails 
                 project={project} 
                 currentUser={currentUser}
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
        case 'profile': return currentUser ? <ProfilePage currentUser={currentUser} onUserUpdated={handleUserUpdated} /> : null;
        case 'services':
          return (
            <VisitorServices
              onSelectService={handleSelectService}
              onAddService={handleAddServiceToBasket}
            />
          );
        case 'service-details':
          return selectedServiceId ? (
            <VisitorServiceDetails
              serviceId={selectedServiceId}
              onBack={() => setCurrentPage('services')}
              onContact={() => setCurrentPage('basket')}
              onAddService={handleAddServiceToBasket}
            />
          ) : (
            <VisitorServices
              onSelectService={handleSelectService}
              onAddService={handleAddServiceToBasket}
            />
          );
        case 'basket':
          return (
            <ProjectBasketPage
              services={projectBasket}
              isAuthenticated
              onBrowseServices={() => setCurrentPage('services')}
              onProceed={() => setCurrentPage('new-request')}
              onRemoveService={handleRemoveServiceFromBasket}
              onClearBasket={handleClearBasket}
            />
          );
        case 'new-request':
          return (
            <CreateProjectRequestPage
              basketServices={projectBasket}
              onSubmit={handleCreateProjectRequest}
            />
          );
        case 'requests':
          return (
            <ProjectRequestsPage
              projectRequests={projectRequests}
              onSelectRequest={handleSelectProjectRequest}
              onCreateNew={() => setCurrentPage('new-request')}
            />
          );
        case 'request-details': {
          const projectRequest = projectRequests.find((item) => item.id === selectedProjectRequestId);
          return projectRequest ? (
            <ProjectRequestDetailsPage
              projectRequest={projectRequest}
              onBack={() => setCurrentPage('requests')}
              onRespond={(action, note) =>
                handleRespondToProjectRequest(projectRequest.id, action, note)
              }
            />
          ) : (
            <ProjectRequestsPage
              projectRequests={projectRequests}
              onSelectRequest={handleSelectProjectRequest}
              onCreateNew={() => setCurrentPage('new-request')}
            />
          );
        }
        case 'dashboard':
          return (
            <ClientDashboard
              currentUser={currentUser}
              projects={projects}
              projectRequests={projectRequests}
              onSelectProject={(id) => handleNavigate('project-details', id)}
              onSelectRequest={handleSelectProjectRequest}
              onNavigate={handleNavigate}
            />
          );
        default:
          return (
            <ClientDashboard
              currentUser={currentUser}
              projects={projects}
              projectRequests={projectRequests}
              onSelectProject={(id) => handleNavigate('project-details', id)}
              onSelectRequest={handleSelectProjectRequest}
              onNavigate={handleNavigate}
            />
          );
      }
    }

    if (role === 'employee') {
      switch (currentPage) {
        case 'profile': return currentUser ? <ProfilePage currentUser={currentUser} onUserUpdated={handleUserUpdated} /> : null;
        case 'dashboard': return <EmployeeDashboard currentUser={currentUser} projects={projects} onSelectProject={(id) => handleNavigate('project-details', id)} onUpdateProject={(id) => handleNavigate('project-update', id)} />;
        default: return <EmployeeDashboard currentUser={currentUser} projects={projects} onSelectProject={(id) => handleNavigate('project-details', id)} onUpdateProject={(id) => handleNavigate('project-update', id)} />;
      }
    }

    if (role === 'admin') {
      switch (currentPage) {
        case 'profile': return currentUser ? <ProfilePage currentUser={currentUser} onUserUpdated={handleUserUpdated} /> : null;
        case 'admin-project-requests':
          return (
            <AdminProjectRequestsPage
              projectRequests={projectRequests}
              onSelectRequest={handleSelectProjectRequest}
            />
          );
        case 'request-details': {
          const projectRequest = projectRequests.find((item) => item.id === selectedProjectRequestId);
          return projectRequest ? (
            <AdminProjectRequestDetailsPage
              projectRequest={projectRequest}
              onBack={() => setCurrentPage('admin-project-requests')}
              onSave={(updates) => handleAdminUpdateProjectRequest(projectRequest.id, updates)}
              onTransitionToProject={() => handleTransitionProjectRequestToProject(projectRequest.id)}
            />
          ) : (
            <AdminProjectRequestsPage
              projectRequests={projectRequests}
              onSelectRequest={handleSelectProjectRequest}
            />
          );
        }
        case 'dashboard':
          return (
            <AdminDashboard
              users={users}
              projects={projects}
              projectRequests={projectRequests}
              onNavigate={handleNavigate}
            />
          );
        case 'users': return <UserManagement users={users} setUsers={setUsers} />;
        case 'projects': return <ProjectManagement projects={projects} setProjects={setProjects} users={users} onSelectProject={(id) => handleNavigate('project-details', id)} />;
        default:
          return (
            <AdminDashboard
              users={users}
              projects={projects}
              projectRequests={projectRequests}
              onNavigate={handleNavigate}
            />
          );
      }
    }

    return <div>Page Not Found</div>;
  };

  return (
    <Layout 
      role={role} 
      user={currentUser} 
      currentPage={currentPage}
      basketCount={projectBasket.length}
      projects={projects}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}
