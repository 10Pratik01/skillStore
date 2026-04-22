import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/users/${id}`);
        fetchUsers(); // Refresh
      } catch (error) {
        console.error("Failed to delete user", error);
      }
    }
  };

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-textMain tracking-tight mb-2">Manage Users</h1>
          <p className="text-secondary text-lg">View and manage all registered users.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-600">ID</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Username</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Email</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Role</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-gray-500">#{user.id}</td>
                  <td className="py-4 px-6 font-medium text-textMain">{user.username}</td>
                  <td className="py-4 px-6 text-gray-500">{user.email}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'INSTRUCTOR' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
