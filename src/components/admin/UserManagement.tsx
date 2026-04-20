import {
  Edit2,
  Mail,
  PencilLine,
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { getAuthHeaders } from '../../lib/auth';
import type { EmployeeType, User, UserRole } from '../../types';

interface UserManagementProps {
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
  employeeTypeId: string;
  speciality: string;
  notes: string;
}

const emptyForm: UserFormState = {
  name: '',
  email: '',
  role: 'employee',
  password: '',
  phone: '',
  employeeTypeId: '',
  speciality: '',
  notes: '',
};

export function UserManagement({ users, setUsers, currentUser }: UserManagementProps) {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [userForm, setUserForm] = useState<UserFormState>(emptyForm);

  const [employeeTypes, setEmployeeTypes] = useState<EmployeeType[]>([]);
  const [employeeTypeForm, setEmployeeTypeForm] = useState({ id: '', name: '', description: '' });
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/admin/employee-types', {
      headers: getAuthHeaders(),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load employee types');
        return res.json();
      })
      .then((payload) => {
        setEmployeeTypes(payload?.data || []);
      })
      .catch((error) => {
        console.error('Unable to load employee types.', error);
      });
  }, []);

  const filteredUsers = users.filter((user) => {
    if (user.role === 'client') return false;
    
    const haystack = [
      user.name,
      user.email,
      user.role,
      user.employeeTypeName || '',
      user.speciality || '',
    ]
      .join(' ')
      .toLowerCase();
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
      role: user.role,
      password: '',
      phone: user.phone || '',
      employeeTypeId: user.employeeTypeId || '',
      speciality: user.speciality || '',
      notes: user.notes || '',
    });
    setIsUserModalOpen(true);
  };

  const handleCreateOrUpdateUser = async (event: FormEvent) => {
    event.preventDefault();

    const payload = {
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      password: userForm.password || undefined,
      phone: userForm.phone || undefined,
      employeeTypeId: userForm.role === 'employee' ? userForm.employeeTypeId || undefined : undefined,
      speciality: userForm.role === 'employee' ? userForm.speciality || undefined : undefined,
      notes: userForm.role === 'employee' ? userForm.notes || undefined : undefined,
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
          throw new Error(updatePayload?.error?.message || 'Unable to update user.');
        }

        let nextUser = updatePayload?.data as User;

        if (payload.role === 'employee' && payload.employeeTypeId) {
          const profileRes = await fetch(
            `http://localhost:5001/api/admin/employees/${editUser.id}/profile`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
              },
              body: JSON.stringify({
                employeeTypeId: payload.employeeTypeId,
                speciality: payload.speciality,
                notes: payload.notes,
              }),
            },
          );

          const profilePayload = await profileRes.json().catch(() => null);

          if (profileRes.ok) {
            nextUser = {
              ...nextUser,
              employeeTypeId: profilePayload?.data?.employeeTypeId,
              employeeTypeName: profilePayload?.data?.employeeTypeName,
              speciality: profilePayload?.data?.speciality,
              notes: profilePayload?.data?.notes,
            };
          }
        }

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
          throw new Error(createPayload?.error?.message || 'Unable to create user.');
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

  const handleSaveEmployeeType = async (event: FormEvent) => {
    event.preventDefault();

    const method = employeeTypeForm.id ? 'PUT' : 'POST';
    const url = employeeTypeForm.id
      ? `http://localhost:5001/api/admin/employee-types/${employeeTypeForm.id}`
      : 'http://localhost:5001/api/admin/employee-types';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: employeeTypeForm.name,
          description: employeeTypeForm.description,
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(payload?.error?.message || 'Unable to save employee type.');
      }

      const nextType = payload?.data as EmployeeType;

      setEmployeeTypes((current) =>
        employeeTypeForm.id
          ? current.map((item) => (item.id === employeeTypeForm.id ? nextType : item))
          : [...current, nextType].sort((a, b) => a.name.localeCompare(b.name)),
      );

      setEmployeeTypeForm({ id: '', name: '', description: '' });
      setIsTypeModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEmployeeType = async () => {
    if (!typeToDelete) return;

    try {
      await fetch(`http://localhost:5001/api/admin/employee-types/${typeToDelete}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setEmployeeTypes((current) => current.filter((item) => item.id !== typeToDelete));
      setTypeToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Team Management</h2>
          <p className="mt-1 max-w-2xl font-medium text-slate-500">
            Manage employees, administrators, employee types, and employee profiles from a
            single admin workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsTypeModalOpen(true)}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
          >
            Manage Employee Types
          </button>
          <button
            onClick={openCreateUser}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
          >
            <UserPlus size={18} />
            Provision User
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="relative w-full md:w-96">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, role, employee type..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/60">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      User Profile
                    </th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Role
                    </th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Employee Profile
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
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-500">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold tracking-tight text-slate-900">{user.name}</p>
                            <p className="flex items-center gap-1 text-xs font-medium text-slate-400">
                              <Mail size={12} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                            user.role === 'admin'
                              ? 'border border-indigo-100 bg-indigo-50 text-indigo-700'
                              : user.role === 'employee'
                                ? 'border border-blue-100 bg-blue-50 text-blue-700'
                                : 'border border-slate-200 bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Shield size={12} />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {user.role === 'employee' ? (
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-900">
                              {user.employeeTypeName || 'No employee type'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.speciality || 'No speciality yet'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Not applicable</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditUser(user)}
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200"
                            title="Edit user"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteUserId(user.id)}
                            className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Employee Types</h3>
            </div>
            <div className="mt-5 space-y-3">
              {employeeTypes.map((type) => (
                <div key={type.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{type.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {type.description || 'No description yet.'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEmployeeTypeForm({
                            id: type.id,
                            name: type.name,
                            description: type.description || '',
                          });
                          setIsTypeModalOpen(true);
                        }}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white"
                      >
                        <PencilLine size={15} />
                      </button>
                      <button
                        onClick={() => setTypeToDelete(type.id)}
                        className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-white"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {isUserModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6">
              <h3 className="flex items-center gap-2 font-bold uppercase tracking-tight text-slate-900">
                <UserPlus size={18} className="text-indigo-600" />
                {editUser ? 'Edit User' : 'Provision New User'}
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
                  <label className="text-xs font-bold uppercase text-slate-500">Role</label>
                  <select
                    value={userForm.role}
                    disabled={editUser?.id === currentUser?.id}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, role: event.target.value as UserRole }))
                    }
                    className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 ${editUser?.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Administrator</option>
                  </select>
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

              {userForm.role === 'employee' ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Employee Type</label>
                    <select
                      required
                      value={userForm.employeeTypeId}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, employeeTypeId: event.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select employee type</option>
                      {employeeTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Speciality</label>
                    <input
                      value={userForm.speciality}
                      onChange={(event) =>
                        setUserForm((prev) => ({ ...prev, speciality: event.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Notes</label>
                    <textarea
                      rows={4}
                      value={userForm.notes}
                      onChange={(event) => setUserForm((prev) => ({ ...prev, notes: event.target.value }))}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
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

      {isTypeModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6">
              <h3 className="font-bold uppercase tracking-tight text-slate-900">
                {employeeTypeForm.id ? 'Edit Employee Type' : 'Create Employee Type'}
              </h3>
              <button
                onClick={() => {
                  setIsTypeModalOpen(false);
                  setEmployeeTypeForm({ id: '', name: '', description: '' });
                }}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEmployeeType} className="space-y-5 p-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500">Name</label>
                <input
                  required
                  value={employeeTypeForm.name}
                  onChange={(event) =>
                    setEmployeeTypeForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                <textarea
                  rows={4}
                  value={employeeTypeForm.description}
                  onChange={(event) =>
                    setEmployeeTypeForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsTypeModalOpen(false);
                    setEmployeeTypeForm({ id: '', name: '', description: '' });
                  }}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-700"
                >
                  Save Type
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
            <h3 className="mb-2 text-xl font-bold text-slate-900">Delete User?</h3>
            <p className="mb-6 text-sm text-slate-500">
              This will permanently revoke access for the selected account.
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

      {typeToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Trash2 size={24} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Delete Employee Type?</h3>
            <p className="mb-6 text-sm text-slate-500">
              Remove this type only if it is no longer used by employee profiles.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTypeToDelete(null)}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDeleteEmployeeType()}
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
