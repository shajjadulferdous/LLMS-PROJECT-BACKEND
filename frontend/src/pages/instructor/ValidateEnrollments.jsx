import { useState, useEffect } from 'react';
import { enrollService } from '../../services/enrollService';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import toast from 'react-hot-toast';

const ValidateEnrollments = () => {
    const [pendingEnrollments, setPendingEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchPendingEnrollments();
    }, []);

    const fetchPendingEnrollments = async () => {
        try {
            setLoading(true);
            const response = await enrollService.getPendingEnrollments();
            setPendingEnrollments(response.data || []);
        } catch (error) {
            console.error('Error fetching pending enrollments:', error);
            toast.error('Failed to load pending enrollments');
        } finally {
            setLoading(false);
        }
    };

    const handleValidation = async (enrollmentId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this enrollment?`)) {
            return;
        }

        try {
            setProcessingId(enrollmentId);
            await enrollService.validateEnrollment(enrollmentId, action);

            if (action === 'approve') {
                toast.success('Enrollment approved! Amount transferred to your account.');
            } else {
                toast.success('Enrollment rejected. Amount refunded to student.');
            }

            // Refresh the list
            await fetchPendingEnrollments();
        } catch (error) {
            console.error('Error validating enrollment:', error);
            toast.error(error.response?.data?.message || 'Failed to validate enrollment');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading pending enrollments...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Validate Enrollments</h1>
                    <p className="text-gray-600 mt-2">
                        Review and validate student enrollment payments
                    </p>
                </div>

                {pendingEnrollments.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">✓</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No Pending Enrollments
                        </h3>
                        <p className="text-gray-500">
                            All enrollment requests have been processed
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingEnrollments.map((enrollment) => (
                            <div
                                key={enrollment._id}
                                className="card hover:shadow-lg transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={enrollment.student?.profilePicture || 'https://via.placeholder.com/80'}
                                                alt={enrollment.student?.fullName}
                                                className="w-16 h-16 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/80?text=Student';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {enrollment.student?.fullName || enrollment.student?.username}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {enrollment.student?.email}
                                                </p>
                                                <div className="mt-2">
                                                    <p className="text-sm font-semibold text-blue-600">
                                                        Course: {enrollment.course?.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Amount: <span className="font-bold text-green-600">${enrollment.transactionAmount}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-700 mt-1">
                                                        Bank Account: <span className="font-mono font-bold text-gray-900">{enrollment.studentBankAccount}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Requested: {new Date(enrollment.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => handleValidation(enrollment._id, 'approve')}
                                            disabled={processingId === enrollment._id}
                                            className="btn bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processingId === enrollment._id ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Processing...
                                                </span>
                                            ) : (
                                                '✓ Approve'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleValidation(enrollment._id, 'reject')}
                                            disabled={processingId === enrollment._id}
                                            className="btn bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ValidateEnrollments;
