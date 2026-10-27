import { cn } from '@/ui/utils/cn';

type ContainerProps = React.ComponentProps<'div'>;

export function Container({ className, ...props }: ContainerProps) {
  return <div className={cn('mx-auto w-full max-w-[1248px] px-6', className)} {...props} />;
}
