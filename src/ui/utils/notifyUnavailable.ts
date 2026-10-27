import { toast } from '@/app/libs/toast';

export function notifyUnavailable(feature: string) {
  toast.info(`${feature} não está disponível nesta versão.`);
}
