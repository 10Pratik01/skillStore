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
            // Use the actual logged-in user PK ID
            await axios.post(`/api/orders/enroll?studentId=${user.id}&courseId=${courseId}`);
            alert("Successfully enrolled!");
        } catch (error) {
            alert(error.response?.data || "Failed to enroll");
        }
    }

    const [checkoutCourse, setCheckoutCourse] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [discountResponse, setDiscountResponse] = useState(null);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode) return;
        setValidatingCoupon(true);
        try {
            const res = await axios.get(`/api/coupons/validate/${couponCode}?courseId=${checkoutCourse.id}`);
            setDiscountResponse({ success: true, ...res.data });
        } catch (error) {
            setDiscountResponse({ success: false, message: error.response?.data || "Invalid coupon" });
        } finally {
            setValidatingCoupon(false);
        }
    };

    const confirmEnrollment = async () => {
        try {
            await axios.post(`/api/orders/enroll?studentId=${user.id}&courseId=${checkoutCourse.id}&couponCode=${couponCode}`);
            alert("Payment Successful! You are now enrolled.");
            setCheckoutCourse(null);
            setCouponCode('');
            setDiscountResponse(null);
        } catch (error) {
            alert(error.response?.data || "Failed to process payment");
        }
    };

    if (loading) return <div className="p-8 text-center text-primary">Loading courses...</div>;

    const finalPrice = discountResponse?.success 
        ? Math.max(0, checkoutCourse.price - (discountResponse.type === 'PERCENTAGE' ? checkoutCourse.price * (discountResponse.value / 100) : discountResponse.value))
        : (checkoutCourse ? checkoutCourse.price : 0);

    return (
        <div className="p-8 max-w-7xl mx-auto relative">
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
                                <button onClick={() => setCheckoutCourse(course)} className="btn-primary py-2 px-4 text-sm">
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

            {/* Checkout Modal */}
            {checkoutCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm slide-up">
                    <div className="glass max-w-md w-full p-8 relative border border-primary/30 shadow-2xl shadow-primary/20">
                        <button onClick={() => { setCheckoutCourse(null); setCouponCode(''); setDiscountResponse(null); }} className="absolute top-4 right-4 text-secondary hover:text-white text-xl">&times;</button>
                        
                        <h3 className="text-2xl font-bold text-white mb-6">Secure Checkout</h3>
                        
                        <div className="bg-white/5 p-4 rounded-lg mb-6 border border-white/10">
                            <h4 className="font-bold text-white tracking-wide mb-1">{checkoutCourse.title}</h4>
                            <p className="text-sm text-secondary line-clamp-1">{checkoutCourse.description}</p>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-secondary mb-2">Have a coupon code?</label>
                            <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={couponCode} 
                                    onChange={e => setCouponCode(e.target.value)} 
                                    placeholder="Enter string code" 
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary text-sm uppercase"
                                />
                                <button type="submit" disabled={validatingCoupon || !couponCode} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">
                                    {validatingCoupon ? 'Wait' : 'Apply'}
                                </button>
                            </form>
                            {discountResponse && (
                                <p className={`text-xs mt-2 font-semibold ${discountResponse.success ? 'text-green-400' : 'text-red-400'}`}>
                                    {discountResponse.success ? `Coupon Applied! ${discountResponse.type === 'FLAT' ? '-$'+discountResponse.value : discountResponse.value+'% off'}!` : discountResponse.message}
                                </p>
                            )}
                        </div>

                        <div className="border-t border-white/10 pt-4 mb-8">
                            <div className="flex justify-between items-center mb-2 text-secondary">
                                <span>Original Price:</span>
                                <span>${checkoutCourse.price}</span>
                            </div>
                            {discountResponse?.success && (
                                <div className="flex justify-between items-center mb-2 text-green-400 font-semibold">
                                    <span>Discount:</span>
                                    <span>-${(checkoutCourse.price - finalPrice).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-xl font-bold text-white border-t border-white/10 pt-4 mt-2">
                                <span>Total to Pay:</span>
                                <span>${finalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <button onClick={confirmEnrollment} className="btn-primary w-full py-4 text-lg animate-pulse hover:animate-none">
                            Pay Mock ${finalPrice.toFixed(2)}
                        </button>
                        <p className="text-center text-xs text-secondary mt-4 opacity-50">Powered by Stripe Simulation API</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses;
