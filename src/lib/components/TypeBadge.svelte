<script lang="ts">
	import { formatName, typeColor } from '$lib/utils';

	interface Props {
		type: string;
		size?: 'sm' | 'md';
	}

	const { type, size = 'md' }: Props = $props();
	const color = $derived(typeColor(type));
</script>

<span
	class="inline-flex items-center rounded-full font-semibold text-white shadow-sm {size ===
	'sm'
		? 'px-2 py-0.5 text-[0.65rem]'
		: 'px-3 py-1 text-xs'}"
	style="background-color: {color};"
>
	{formatName(type)}
</span>
