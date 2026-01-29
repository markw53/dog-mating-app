interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function SectionHeader({ 
  badge, 
  title, 
  subtitle, 
  centered = true 
}: SectionHeaderProps) {
  return (
    <div className={`mb-16 ${centered ? 'text-center' : ''}`}>
      {badge && (
        <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">
          {badge}
        </span>
      )}
      <h2 className="section-title mt-2">{title}</h2>
      {subtitle && (
        <p className={`section-subtitle mt-4 ${!centered ? 'mx-0' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}