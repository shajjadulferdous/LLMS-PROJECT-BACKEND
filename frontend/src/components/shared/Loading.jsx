const Loading = ({ fullScreen = false, size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    const spinnerSize = sizeClasses[size] || sizeClasses.md;

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${spinnerSize} mx-auto`}></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center py-8">
            <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${spinnerSize}`}></div>
        </div>
    );
};

export default Loading;
