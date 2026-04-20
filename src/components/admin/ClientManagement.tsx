import { Edit2, Mail, Plus, Search, Shield, Trash2, UserPlus, Users, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { getAuthHeaders } from '../../lib/auth';
import type { User, UserRole } from '../../types';

interface ClientManagementProps {
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser: User | null;
}

interface UserFormState {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  phone: string;
}

const emptyForm: UserFormState = {
  name: '',
  email: '',
  role: 'client',
  password: '',
  phone: '',
};

export function ClientManagement({ users, setUsers, currentUser }: ClientManagementProps) {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [userForm, setUserForm] = useState<UserFormState>(emptyForm);

  const clientUsers = users.filter(user => user.role === 'client');

  const filteredUsers = clientUsers.filter((user) => {
    const haystack = [user.name, user.email, user.role].join(' ').toLowerCase();
    return !search || haystack.includes(search.toLowerCase());
  });

  const openCreateUser = () => {
    setUserForm(emptyForm);
    setEditUser(null);
    setIsUserModalOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: 'client',
      password: '',
      phone: user.phone || '',
    });
    setIsUserModalOpen(true);
  };

  const handleCreateOrUpdateUser = async (event: FormEvent) => {
    event.preventDefault();

    const payload = {
      name: userForm.name,
      email: userForm.email,
      role: 'client',
      password: userForm.password || undefined,
      phone: userForm.phone || undefined,
    };

    try {
      if (editUser) {
        const updateRes = await fetch(`http://localhost:5001/api/users/${editUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        });

        const updatePayload = await updateRes.json().catch(() => null);

        if (!updateRes.ok) {
          throw new Error(updatePayload?.error?.message || 'Unable to update client.');
        }

        const nextUser = updatePayload?.data as User;
        setUsers(users.map((user) => (user.id === editUser.id ? nextUser : user)));
      } else {
        const createRes = await fetch('http://localhost:5001/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        });

        const createPayload = await createRes.json().catch(() => null);

        if (!createRes.ok) {
          throw new Error(createPayload?.error?.message || 'Unable to create client.');
        }

        setUsers([createPayload?.data as User, ...users]);
      }

      setIsUserModalOpen(false);
      setEditUser(null);
      setUserForm(emptyForm);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await fetch(`http://localhost:5001/api/users/${deleteUserId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setUsers(users.filter((user) => user.id !== deleteUserId));
      setDeleteUserId(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Client Accounts</h2>
          <p className="mt-1 max-w-2xl font-medium text-slate-500">
            Manage your client roster, their contact information, and access credentials.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={openCreateUser}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
          >
            <UserPlus size={18} />
            Add New Client
          </button>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="relative w-full md:w-96 mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clients by name, email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Client Profile
                </th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Contact
                </th>
                <th className="px-8 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="transition-all hover:bg-slate-50">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-indigo-50 font-bold text-indigo-600">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold tracking-tight text-slate-900">{user.name}</p>
                        <p className="flex items-center gap-1 text-xs font-medium text-slate-400 mt-1">
                          <Mail size={12} />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-medium text-slate-600">
                      {user.phone || 'No phone provided'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditUser(user)}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                        title="Edit client"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteUserId(user.id)}
                        className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50"
                        title="Delete client"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-10 text-center text-slate-500 font-medium">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isUserModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6">
              <h3 className="flex items-center gap-2 font-bold uppercase tracking-tight text-slate-900">
                <UserPlus size={18} className="text-indigo-600" />
                {editUser ? 'Edit Client Account' : 'Add New Client'}
              </h3>
              <button
                onClick={() => {
                  setIsUserModalOpen(false);
                  setEditUser(null);
                }}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateUser} className="space-y-5 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Full Name</label>
                  <input
                    required
                    value={userForm.name}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                  <input
                    required
                    type="email"
                    value={userForm.email}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Phone</label>
                  <input
                    value={userForm.phone}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {!editUser ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Password</label>
                  <input
                    required
                    value={userForm.password}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserModalOpen(false);
                    setEditUser(null);
                  }}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-700"
                >
                  {editUser ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteUserId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Trash2 size={24} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Delete Client?</h3>
            <p className="mb-6 text-sm text-slate-500">
              This will permanently revoke access for the selected client account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteUserId(null)}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDeleteUser()}
                className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
