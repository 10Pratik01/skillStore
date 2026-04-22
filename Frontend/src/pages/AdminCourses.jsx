import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import axios from 'axios';
import { Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      setCourses(res.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const deleteCourse = async (id) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await axios.delete(`/api/courses/${id}`);
        fetchCourses(); // Refresh
      } catch (error) {
        console.error("Failed to delete course", error);
      }
    }
  };

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-textMain tracking-tight mb-2">Manage Courses</h1>
          <p className="text-secondary text-lg">Monitor and moderate course content.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-600">ID</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Title</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Category</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Price</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-gray-500">#{course.id}</td>
                  <td className="py-4 px-6 font-medium text-textMain">{course.title}</td>
                  <td className="py-4 px-6 text-gray-500">{course.category || 'N/A'}</td>
                  <td className="py-4 px-6 font-medium">${course.price}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      course.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.status || 'DRAFT'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right flex justify-end gap-2">
                    <Link 
                      to={`/courses`} // Adjust link if course detail page exists
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ExternalLink size={18} />
                    </Link>
                    <button 
                      onClick={() => deleteCourse(course.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">No courses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminCourses;
