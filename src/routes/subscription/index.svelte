<script lang="ts">
	import { WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
	import WalletContainer from './WalletContainer.svelte';
	import NotifiForm from '$lib/notifi/NotifiForm.svelte';
</script>

<svelte:head>
	<title>Subscription</title>
	<meta name="description" content="Demo of how to subscribe to notifi" />
</svelte:head>

<div class="subscriptions">
	<h1>Subscription Sample</h1>
	<WalletContainer>
		<WalletMultiButton />
		<NotifiForm />
	</WalletContainer>
</div>
