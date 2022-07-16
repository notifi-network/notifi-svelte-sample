<script lang="ts">
    import ConnectedForm from './ConnectedForm.svelte';
    import { adapterValues } from './stores';
</script>

{#if $adapterValues.publicKey === null}
<div>
    Please connect a wallet to use Notifi
</div>
{/if}
{#if $adapterValues.publicKey !== null && $adapterValues.signerAdapter === null}
<div>
    This wallet does not support signing messages
</div>
{/if}
{#if $adapterValues.publicKey !== null && $adapterValues.signerAdapter !== null}
<ConnectedForm
    adapter={$adapterValues.signerAdapter}
    publicKey={$adapterValues.publicKey}
/>
{/if}