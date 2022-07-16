<script lang="ts">
    import { onDestroy } from 'svelte';
    import type { PublicKey } from '@solana/web3.js';
    import type { WalletAdapter, MessageSignerWalletAdapter } from '@solana/wallet-adapter-base';
    import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
    import ConnectedForm from './ConnectedForm.svelte';

    let publicKey: PublicKey | null = null;
    let signerAdapter: MessageSignerWalletAdapter | null = null;

    const isMessageSigner = (adapter: WalletAdapter): adapter is MessageSignerWalletAdapter => {
        return (<MessageSignerWalletAdapter>adapter).signMessage !== undefined;
    }

    const unsubscribe = walletStore.subscribe(store => {
        const adapter = store?.adapter ?? null;
        if (adapter === null || adapter.publicKey === null) {
            publicKey = null;
            signerAdapter = null;
        } else  {
            publicKey = adapter.publicKey;
            if (isMessageSigner(adapter)) {
                signerAdapter = adapter;
            } else {
                signerAdapter = null;
            }
        }
    });

    onDestroy(unsubscribe);
</script>

{#if publicKey === null}
<div>
    Please connect a wallet to use Notifi
</div>
{/if}
{#if publicKey !== null && signerAdapter === null}
<div>
    This wallet does not support signing messages
</div>
{/if}
{#if publicKey !== null && signerAdapter !== null}
<ConnectedForm
    adapter={signerAdapter}
    publicKey={publicKey}
/>
{/if}