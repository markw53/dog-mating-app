import { ElementType, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  /**
   * Element to render as. Defaults to `div` because a card is only a styling
   * shell; pass `article` when the card is a self-contained item (a dog, a
   * breed, a review) and `section` when it is a titled region of a page.
   */
  as?: ElementType;
}

export function Card({ children, className = '', hover = true, as: Tag = 'div' }: CardProps) {
  return (
    <Tag className={`
      bg-white rounded-2xl shadow-md border border-gray-100 p-6
      ${hover ? 'hover:shadow-xl hover:-translate-y-2 transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </Tag>
  );
}
