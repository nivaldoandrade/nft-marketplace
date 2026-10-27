import { StarIcon } from '@/ui/components/Icons';
import { cn } from '@/ui/utils/cn';

type RatingStarsProps = {
  rating: number;
  className?: string;
};

export function RatingStars({ rating, className }: RatingStarsProps) {
  const filled = Math.floor(rating);

  return (
    <span aria-hidden="true" className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          className={cn('size-[15px]', index < filled ? 'text-primary' : 'text-muted-foreground')}
        />
      ))}
    </span>
  );
}
