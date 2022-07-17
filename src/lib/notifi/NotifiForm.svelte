<script lang="ts">
import { onDestroy } from 'svelte';

	import ConnectedForm from './ConnectedForm.svelte';
	import { DAPP_ADDRESS, notifiService } from './service';
	import { adapterValues } from './stores';
	import { SvelteNotifiClient } from './SvelteNotifiClient';

    let notifiClient: SvelteNotifiClient | null = null;
    const unsubscribe = adapterValues.subscribe(values => {
        if (values.publicKey === null) {
            notifiClient = null;
        } else {
            notifiClient = new SvelteNotifiClient(DAPP_ADDRESS, values.publicKey, notifiService)
        }
    });

    onDestroy(() => {
        unsubscribe();
    })
</script>

{#if notifiClient === null}
	<div>Please connect a wallet to use Notifi</div>
{/if}
{#if notifiClient !== null && $adapterValues.signerAdapter === null}
	<div>This wallet does not support signing messages</div>
{/if}
{#if notifiClient !== null && $adapterValues.signerAdapter !== null}
	<ConnectedForm
		adapter={$adapterValues.signerAdapter}
		{notifiClient}
	/>
{/if}
