import { Project, User, Stat } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'John Admin', email: 'admin@structura.com', role: 'admin', password: 'password123' },
  { id: 'u2', name: 'Jane Employee', email: 'jane@structura.com', role: 'employee', password: 'password123' },
  { id: 'u3', name: 'Michael Smith', email: 'mike@structura.com', role: 'employee', password: 'password123' },
  { id: 'u4', name: 'Robert Client', email: 'robert@client.com', role: 'client', password: 'password123' },
  { id: 'u5', name: 'ACME Corp', email: 'contact@acme.com', role: 'client', password: 'password123' },
];

export const mockProjects: Project[] = [
  {
    id: 'PRJ001',
    title: 'Downtown Bridge Expansion',
    description: 'Structural reinforcement and expansion of the main downtown bridge including new pedestrian pathways.',
    status: 'in-progress',
    clientId: 'u5',
    clientName: 'ACME Corp',
    employeeId: 'u2',
    employeeName: 'Jane Employee',
    progress: 65,
    startDate: '2024-01-15',
    budget: '$4.2M',
    location: 'Downtown Riverside',
    documents: [
      { id: 'd1', name: 'Site_Plan_V2.pdf', type: 'PDF', size: '2.4 MB', uploadDate: '2024-01-16' },
      { id: 'd2', name: 'Structural_Analysis.xlsx', type: 'XLSX', size: '1.1 MB', uploadDate: '2024-02-10' },
    ],
    updates: [
      { id: 'u1', date: '2024-03-20', authorName: 'Jane Employee', content: 'Foundation pouring completed for Sector A.', statusChange: 'in-progress' },
      { id: 'u2', date: '2024-03-15', authorName: 'Jane Employee', content: 'Material inspection passed by municipal board.' }
    ]
  },
  {
    id: 'PRJ002',
    title: 'Industrial Warehouse Solar',
    description: 'Installation of high-efficiency solar panel array and power management system for the north-side industrial complex.',
    status: 'pending',
    clientId: 'u4',
    clientName: 'Robert Client',
    employeeId: 'u2',
    employeeName: 'Jane Employee',
    progress: 10,
    startDate: '2024-04-01',
    budget: '$850k',
    location: 'North Industrial Port',
    documents: [
      { id: 'd3', name: 'Electrical_Schematics.pdf', type: 'PDF', size: '5.8 MB', uploadDate: '2024-03-25' }
    ],
    updates: []
  },
  {
    id: 'PRJ003',
    title: 'Oceanview Residential Complex',
    description: 'Foundation work and basic framing for 12 luxury residential units with sustainable ocean-cooling architecture.',
    status: 'completed',
    clientId: 'u5',
    clientName: 'ACME Corp',
    employeeId: 'u3',
    employeeName: 'Michael Smith',
    progress: 100,
    startDate: '2023-06-10',
    endDate: '2024-02-15',
    budget: '$12.5M',
    location: 'South Coastal Road',
    documents: [],
    updates: [
      { id: 'u3', date: '2024-02-15', authorName: 'Michael Smith', content: 'Final inspection signed off. Keys handed over to client.', statusChange: 'completed' }
    ]
  },
  {
    id: 'PRJ004',
    title: 'City Hall Renovation',
    description: 'Full interior renovation and facade restoration of the historic City Hall building, including accessibility upgrades.',
    status: 'on-hold',
    clientId: 'u4',
    clientName: 'Robert Client',
    employeeId: 'u3',
    employeeName: 'Michael Smith',
    progress: 30,
    startDate: '2024-02-01',
    budget: '$2.1M',
    location: 'City Center District',
    documents: [
      { id: 'd4', name: 'Heritage_Assessment.pdf', type: 'PDF', size: '3.2 MB', uploadDate: '2024-02-05' }
    ],
    updates: [
      { id: 'u4', date: '2024-03-01', authorName: 'Michael Smith', content: 'Project paused pending permit approval from heritage commission.', statusChange: 'on-hold' }
    ]
  }
];

export const mockStats: Stat[] = [
  { label: 'Active Projects', value: '24', change: '+12%', trend: 'up' },
  { label: 'Total Clients', value: '156', change: '+8%', trend: 'up' },
  { label: 'Employee Utilization', value: '92%', change: '-2%', trend: 'down' },
  { label: 'Revenue (Q1)', value: '$2.4M', change: '+18%', trend: 'up' },
];
