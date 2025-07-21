function LoadingSpinner() {
    return (
        <div className="flex flex-col justify-center items-center min-h-[600px]">
            <div className="animate-spin h-12 w-12 border-t-4 border-b-4 border-slate-500 rounded-full"></div>
            <p className="mt-5 font-semibold italic text-slate-500 animate-bounce">Loading</p>
        </div>
    )
}

export default LoadingSpinner