interface DogImagePlaceholderProps {
  className?: string;
  name?: string;
}

export default function DogImagePlaceholder({ 
  className = '', 
  name = 'Dog' 
}: DogImagePlaceholderProps) {
  return (
    <div className={`bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 flex flex-col items-center justify-center ${className}`}>
      <svg
        className="w-20 h-20 text-gray-400 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="text-sm font-medium text-gray-500">{name}</p>
      <p className="text-xs text-gray-400 mt-1">No photo available</p>
    </div>
  );
}