import { useNftReviews } from '@/app/hooks/queries/nfts/useNftReviews';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { RatingStars } from '@/ui/pages/nftDetails/components/RatingStars';

type ReviewsListProps = {
  nftId: string;
  enabled: boolean;
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' });

export function ReviewsList({ nftId, enabled }: ReviewsListProps) {
  const { reviews, isPending, isError, refetch } = useNftReviews(nftId, enabled);

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 py-2">
        <p className="text-sm leading-6 text-muted-foreground">
          Não foi possível carregar as avaliações.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="h-9 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground pressable hover:bg-accent"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (isPending) {
    return (
      <ul aria-busy="true" aria-label="Carregando avaliações" className="flex flex-col gap-6">
        {Array.from({ length: 3 }, (_, index) => (
          <li key={index} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-primary/15">
      {reviews.map((review) => (
        <li key={review.id} className="flex flex-col gap-1.5 py-4 first:pt-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-[15px] leading-5 font-bold">{review.author}</p>
            <RatingStars rating={review.rating} />
            <span className="sr-only">Nota {review.rating} de 5</span>
            <time dateTime={review.createdAt} className="text-[13px] leading-5 text-subtle">
              {dateFormatter.format(new Date(review.createdAt))}
            </time>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{review.comment}</p>
        </li>
      ))}
    </ul>
  );
}
