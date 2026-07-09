<script lang="ts">
	interface Props {
		src: string | null | undefined;
		alt: string;
		fallback?: string | null;
		class?: string;
		eager?: boolean;
	}

	const {
		src,
		alt,
		fallback = null,
		class: className = '',
		eager = false,
	}: Props = $props();

	let loaded = $state(false);
	let errored = $state(false);
	let fallbackFailed = $state(false);
	const currentSrc = $derived(
		fallbackFailed ? null : errored ? (fallback ?? null) : src
	);
</script>

<div class="relative flex items-center justify-center {className}">
	{#if !loaded && !errored}
		<div class="skeleton absolute inset-0 h-full w-full"></div>
	{/if}
	{#if currentSrc}
		<img
			src={currentSrc}
			{alt}
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			class="h-full w-full object-contain transition-opacity duration-300"
			class:opacity-0={!loaded}
			class:opacity-100={loaded}
			onload={() => (loaded = true)}
			onerror={() => {
				if (!errored && fallback && currentSrc !== fallback) {
					// First failure with a fallback available — retry it.
					errored = true;
				} else {
					// No fallback, or the fallback itself failed — show placeholder.
					errored = true;
					fallbackFailed = true;
				}
			}}
		/>
	{:else}
		<div
			class="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-700"
			aria-hidden="true"
		>
			<svg viewBox="0 0 24 24" class="h-1/2 w-1/2" fill="currentColor">
				<path
					d="M12 2a10 10 0 0 0-9.95 9h6.08a4 4 0 0 1 7.74 0h6.08A10 10 0 0 0 12 2Zm0 20a10 10 0 0 0 9.95-9h-6.08a4 4 0 0 1-7.74 0H2.05A10 10 0 0 0 12 22Z"
				/>
			</svg>
		</div>
	{/if}
</div>
