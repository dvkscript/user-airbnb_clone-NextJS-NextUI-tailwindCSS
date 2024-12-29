import React from 'react';

const LoaderSpinner = ({ }) => {
    return (
        <div className="flex h-full items-center justify-center dark:bg-default-100">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-red-600 border-t-transparent"></div>
        </div>
    );
};

export default LoaderSpinner;