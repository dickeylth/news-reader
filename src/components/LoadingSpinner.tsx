import { component$ } from '@builder.io/qwik';

export const LoadingSpinner = component$(() => {
  return (
    <div class="flex justify-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );
}); 