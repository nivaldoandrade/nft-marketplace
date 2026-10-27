import { useNewsletter } from '@/ui/components/Footer/useNewsletter';

export function Newsletter() {
  const { register, error, handleSubmit } = useNewsletter();

  return (
    <div className="flex flex-col gap-3 max-md:text-center md:col-span-3 md:grid md:grid-cols-2 md:items-center md:gap-x-8 md:gap-y-2 lg:grid-cols-[1fr_400px] xl:col-span-1 xl:flex xl:gap-3 xl:pl-4">
      <h2
        id="newsletter-title"
        className="text-lg leading-5 font-bold md:col-start-1 md:row-start-1 md:self-end xl:mb-1 xl:leading-4"
      >
        Antecipe-se ao próximo lançamento
      </h2>
      <form
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby="newsletter-title"
        className="flex w-full max-w-[400px] flex-col gap-1 max-md:mx-auto md:col-start-2 md:row-span-2 md:row-start-1 md:justify-self-end xl:max-w-none"
      >
        <div className="flex h-10 overflow-hidden rounded-md bg-muted shadow-[0_0_20px_rgba(10,6,4,0.45)]">
          <label htmlFor="newsletter-email" className="sr-only">
            E-mail
          </label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="digite seu e-mail..."
            aria-invalid={!!error}
            aria-describedby={error ? 'newsletter-error' : undefined}
            className="min-w-0 flex-1 bg-transparent px-3 text-base placeholder:text-subtle focus-visible:outline-offset-[-2px] md:text-sm"
            {...register('email')}
          />
          <button
            type="submit"
            className="w-[85px] shrink-0 bg-primary pr-1 pl-4 text-left text-lg font-bold text-primary-foreground pressable hover:bg-accent"
          >
            Enviar
          </button>
        </div>
        {error && (
          <p id="newsletter-error" role="alert" className="text-sm text-coral">
            {error}
          </p>
        )}
      </form>
      <p className="text-[13px] leading-[22px] text-muted-foreground md:col-start-1 md:row-start-2 md:self-start">
        Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
      </p>
    </div>
  );
}
