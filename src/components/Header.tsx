import { component$ } from '@builder.io/qwik';

export const Header = component$(() => {
  return (
    <header class="bg-orange-500 p-4 sticky top-0 z-10">
      <h1 class="text-2xl font-bold text-white">Hacker News Reader</h1>
    </header>
  );
}); 