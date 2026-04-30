import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn('mx-auto max-w-[720px] px-6 py-12', className)}>
      {children}
    </div>
  );
}
