export default function LoadingPreview() {
  return (
    <div className="flex justify-center items-center py-20 animate-fadeIn">
      <div className="flex flex-col items-center gap-6">
        {/* Animated circles */}
        <div className="flex items-center gap-3">
          {/* Circle 1 */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 opacity-70 animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
          
          {/* Circle 2 */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 animate-pulse" style={{ animationDelay: '100ms' }}></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 opacity-70 animate-pulse" style={{ animationDelay: '300ms' }}></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 animate-pulse" style={{ animationDelay: '500ms' }}></div>
          </div>
          
          {/* Circle 3 */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 opacity-70 animate-pulse" style={{ animationDelay: '400ms' }}></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 animate-pulse" style={{ animationDelay: '600ms' }}></div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-xl font-medium text-[var(--foreground)] mb-1">
            We are downloading the content. Please wait :)
          </p>
          <p className="text-sm text-[var(--placeholder)]">
            This usually takes just a few seconds
          </p>
        </div>
      </div>
    </div>
  );
}
