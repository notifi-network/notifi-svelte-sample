<script lang="ts">
	import type { MessageSignerWalletAdapter } from '@solana/wallet-adapter-base';
	import type { SvelteNotifiClient } from './SvelteNotifiClient';
	import { clientState, clientData } from './stores';
	import { onDestroy } from 'svelte';

	export let adapter: MessageSignerWalletAdapter;
	export let notifiClient: SvelteNotifiClient;

	let emailInput = '';
	let telegramInput = '';
	let announcementsSubscribed = false;
	let telegramConfirmationUrl = '';
	let loading = false;

	const TOPIC_NAME = 'notifish__creatorUpdates'; // Talk to us for the right value
	const ALERT_NAME = 'Svelte Sample Alert';

	const ensureAlertDeleted = async () => {
		const data = await notifiClient.fetchData();
		const alertId = data.alerts.find((alert) => alert.name === ALERT_NAME)?.id ?? null;
		if (alertId === null) {
			return;
		}

		await notifiClient.deleteAlert({ alertId });
	};

	const ensureAlertExists = async () => {
		const data = await notifiClient.fetchData();
		const announcementAlert = data.alerts.find((alert) => alert.name === ALERT_NAME);
		if (announcementAlert !== undefined && announcementAlert.id !== null) {
			console.log('Updating alert', announcementAlert.id);
			return notifiClient.updateAlert({
				alertId: announcementAlert.id,
				emailAddress: emailInput === '' ? null : emailInput,
				phoneNumber: null, // TODO
				telegramId: telegramInput === '' ? null : telegramInput
			});
		} else {
			// Make sure the Broadcast source exists
			console.log('Creating alert');
			const existingSource = data.sources.find((s) => s.blockchainAddress === TOPIC_NAME);
			const source =
				existingSource !== undefined
					? existingSource
					: await notifiClient.createSource({
							name: TOPIC_NAME,
							blockchainAddress: TOPIC_NAME,
							type: 'BROADCAST'
					  });

			if (source.id === null) {
				throw new Error('Invalid source');
			}

			const filterId =
				source.applicableFilters.find((f) => f.filterType === 'BROADCAST_MESSAGES')?.id ?? null;
			if (filterId === null) {
				throw new Error('Unable to locate applicable filter');
			}

			return notifiClient.createAlert({
				name: ALERT_NAME,
				sourceId: source.id,
				filterId,
				emailAddress: emailInput === '' ? null : emailInput,
				phoneNumber: null, // TODO
				telegramId: telegramInput === '' ? null : telegramInput
			});
		}
	};

	const handleSubmit = () => {
		loading = true;
		if (announcementsSubscribed && (emailInput !== '' || telegramInput !== '')) {
			ensureAlertExists()
				.then((a) => {
					console.log('Alert created', a);
				})
				.catch((e) => alert(e));
		} else {
			ensureAlertDeleted()
				.then(() => {
					console.log('Alert deleted');
				})
				.catch((e) => alert(e));
		}
	};

	const unsubscribe = clientData.subscribe(($clientData) => {
		if ($clientData === null || loading) {
			return;
		}

		const alert = $clientData.alerts?.find((a) => a.name === ALERT_NAME);
		if (alert === undefined) {
			announcementsSubscribed = false;
			emailInput = '';
			telegramInput = '';
			telegramConfirmationUrl = '';
		} else {
			announcementsSubscribed = true;
			emailInput = alert.targetGroup.emailTargets[0]?.emailAddress ?? '';

			const telegramTarget = alert.targetGroup.telegramTargets[0];
			telegramInput = telegramTarget?.telegramId ?? '';
			if (telegramTarget !== undefined) {
				telegramConfirmationUrl =
					$clientData.telegramTargets.find((t) => t.id === telegramTarget.id)?.confirmationUrl ??
					'';
			} else {
				telegramConfirmationUrl = '';
			}
		}
	});
	onDestroy(unsubscribe);
</script>

<div class="notifi">
	<div>
		{#if $clientState.token !== null}
			Logged in!<br />
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
		{#if telegramConfirmationUrl !== ''}
			<a href={telegramConfirmationUrl} target="_blank" referrerpolicy="no-referrer"
				>Click here to verify your Telegram</a
			>
		{/if}
		<fieldset>
			<legend>Active Subscriptions</legend>
			<label for="announcements">Notifi Announcements</label>
			<input type="checkbox" bind:checked={announcementsSubscribed} />
		</fieldset>
	</form>
	<br />
	<button on:click={handleSubmit}>
		{#if $clientData === null || $clientData.alerts?.find((a) => a.name === ALERT_NAME) === undefined}
			Subscribe
		{:else}
			Update Subscription
		{/if}</button
	>

	<div>
		<h5>Debug Data</h5>
		<p>{JSON.stringify($clientData)}</p>
	</div>
</div>
