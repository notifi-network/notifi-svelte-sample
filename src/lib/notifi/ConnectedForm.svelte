<script lang="ts">
	import type { MessageSignerWalletAdapter } from '@solana/wallet-adapter-base';
	import type { SvelteNotifiClient } from './SvelteNotifiClient';
	import { clientState } from './stores';
	import { get } from 'svelte/store';

	export let adapter: MessageSignerWalletAdapter;
	export let notifiClient: SvelteNotifiClient;

	let emailInput = '';
	let telegramInput = '';
	let announcementsSubscribed = false;

	const alertToken = () => {
		alert(`Authorization: Bearer ${get(clientState).token}`);
	};

	const handleSubmit = () => {
		console.log('Submit!', emailInput, telegramInput, announcementsSubscribed, adapter);
	};
</script>

<div class="notifi">
	<div>
		{#if $clientState.token !== null}
			Logged in!<br />
			<button on:click={() => alertToken()}>Show token</button>
			<button on:click={() => notifiClient.logOut().catch(console.log)}>Log out</button>
		{/if}
		{#if $clientState.token === null}
			Not logged in<br />
			<button on:click={() => notifiClient.logIn(adapter).catch(console.log)}>Log in</button>
		{/if}
	</div>

	<br />
	<br />

	<form disabled={$clientState.token === null}>
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
	<br />
	<button on:click={handleSubmit}>Subscribe</button>
</div>
