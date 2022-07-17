<script lang="ts">
	import { onDestroy } from 'svelte';

	import ConnectedForm from './ConnectedForm.svelte';
	import {
		adapterValues,
		notifiClient,
		clientState,
		dappAddress,
		notifiEnvironment
	} from './stores';
</script>

<form />

<div class="notifi">
	<form>
		<fieldset>
			<legend>Notifi Configuration</legend>
			<label for="dappAddress">dApp Address</label>
			<input
				type="text"
				name="dappAddress"
				bind:value={$dappAddress}
				disabled={$clientState.token !== null}
			/>
			<label for="environment">Environment</label>
			<input
				type="text"
				name="environment"
				bind:value={$notifiEnvironment}
				disabled={$clientState.token !== null}
			/>
		</fieldset>
	</form>

	<br />
	<br />

	{#if $notifiClient === null}
		<div>Please connect a wallet to use Notifi</div>
	{/if}
	{#if $notifiClient !== null && $adapterValues.signerAdapter === null}
		<div>This wallet does not support signing messages</div>
	{/if}
	{#if $notifiClient !== null && $adapterValues.signerAdapter !== null}
		<ConnectedForm adapter={$adapterValues.signerAdapter} notifiClient={$notifiClient} />
	{/if}
</div>
