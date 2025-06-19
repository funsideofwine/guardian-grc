import Link from 'next/link';
import { ChevronRightIcon } from '@radix-ui/react-icons';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center text-sm text-muted mb-4" aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <span key={item.label} className="flex items-center">
          {item.href && idx !== items.length - 1 ? (
            <Link href={item.href} className="hover:underline hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-primary">{item.label}</span>
          )}
          {idx < items.length - 1 && (
            <ChevronRightIcon className="mx-2 w-4 h-4 text-muted" />
          )}
        </span>
      ))}
    </nav>
  );
} 