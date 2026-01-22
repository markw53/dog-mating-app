import { Dog as DogIcon } from 'lucide-react';

interface DogImagePlaceholderProps {
  className?: string;
}

export default function DogImagePlaceholder({ className = '' }: DogImagePlaceholderProps) {
  return (
    <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
      <DogIcon className="h-16 w-16 text-gray-400" />
    </div>
  );
}