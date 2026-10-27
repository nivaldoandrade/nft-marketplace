import { cn } from '@/ui/utils/cn';

export const fieldInputClassName =
  'h-10 w-full rounded-[3px] border border-border bg-transparent px-3 text-sm text-foreground placeholder:text-subtle focus-visible:border-primary focus-visible:outline-none aria-invalid:border-coral';

export const fieldSelectTriggerClassName = cn(
  fieldInputClassName,
  'h-10 justify-between rounded-[3px] py-0 pr-2 shadow-none data-[placeholder]:text-subtle data-[size=default]:h-10 dark:bg-transparent dark:hover:bg-transparent [&_svg]:size-[18px] [&_svg]:!text-foreground',
);

export const fieldSelectContentClassName = 'border-border bg-card font-sans';
