<script lang="ts">
	import type { MessageSignerWalletAdapter } from '@solana/wallet-adapter-base';
	import type { SvelteNotifiClient } from './SvelteNotifiClient';

	export let adapter: MessageSignerWalletAdapter;
	export let notifiClient: SvelteNotifiClient;

	let emailInput = '';
	let telegramInput = '';
	let announcementsSubscribed = false;

	const isAuthenticated = notifiClient._token !== '';

	const alertToken = () => {
		alert(`Authorization: Bearer ${notifiClient._token}`);
	}

	const handleSubmit = () => {
		console.log('Submit!', emailInput, telegramInput, announcementsSubscribed, adapter);
	};
</script>

<div class="subscriptions">
	<h1>Subscription Sample</h1>
	<div>
		{#if isAuthenticated}
			Logged in!
			<button on:click={alertToken}>Show token</button>
			<button on:click={() => notifiClient.logOut().catch(console.log)}>Log out</button>
		{/if}
		{#if !isAuthenticated}
			Log in
			<button on:click={() => notifiClient.logIn(adapter).catch(console.log)}>Log in</button>
		{/if}
	</div>

	<form disabled={!isAuthenticated}>
		<fieldset>
			<legend>Contact Information</legend>
			<label for="email">Email Address</label>
			<input type="email" name="email" bind:value={emailInput} />
			<label for="telegram">Telegram ID</label>
			<input type="text" name="telegram" bind:value={telegramInput} />
		</fieldset>
		<fieldset>
			<legend>Active Subscriptions</legend>
			<label for="announcements">Notifi Announcements</label>
			<input type="checkbox" bind:checked={announcementsSubscribed} />
		</fieldset>
	</form>
	<button on:click={handleSubmit}>Subscribe</button>
</div>
