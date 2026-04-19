import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('/api/courses');
                setCourses(response.data);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleEnroll = async (courseId) => {
        try {
            // This is a naive implementation assuming we have studentId.
            // In a better setup, the token contains the studentId or the backend inferred it.
            // We pass studentId=1 for demo since user info object does not currently hold DB PK ID.
            await axios.post(`/api/orders/enroll?studentId=1&courseId=${courseId}`);
            alert("Successfully enrolled!");
        } catch (error) {
            alert(error.response?.data || "Failed to enroll");
        }
    }

    if (loading) return <div className="p-8 text-center text-primary">Loading courses...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Course Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="glass p-6 flex flex-col items-start transition-transform hover:-translate-y-1 hover:shadow-primary/20 hover:shadow-2xl">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 bg-primary/10 px-2 py-1 rounded">
                            {course.category || 'General'}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                        <p className="text-secondary text-sm mb-4 line-clamp-3">{course.description}</p>
                        <div className="mt-auto w-full flex items-center justify-between">
                            <span className="text-lg font-bold text-white">${course.price}</span>
                            {user?.role === 'STUDENT' && (
                                <button onClick={() => handleEnroll(course.id)} className="btn-primary py-2 px-4 text-sm">
                                    Enroll Now
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {courses.length === 0 && (
                <div className="text-center text-secondary py-12">No courses available at the moment.</div>
            )}
        </div>
    );
};

export default Courses;
