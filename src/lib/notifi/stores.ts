import { derived } from "svelte/store";
import type { PublicKey } from '@solana/web3.js';
import type { WalletAdapter, MessageSignerWalletAdapter } from '@solana/wallet-adapter-base';
import { walletStore } from '@svelte-on-solana/wallet-adapter-core';

export type AdapterValues = Readonly<{
    publicKey: PublicKey | null;
    signerAdapter: MessageSignerWalletAdapter | null;
}>;

const isMessageSigner = (adapter: WalletAdapter): adapter is MessageSignerWalletAdapter => {
    return (<MessageSignerWalletAdapter>adapter).signMessage !== undefined;
}

export const adapterValues = derived<typeof walletStore, AdapterValues>(
    walletStore,
    $store => {
        let publicKey: PublicKey | null = null;
        let signerAdapter: MessageSignerWalletAdapter | null = null;
        const adapter = $store?.adapter ?? null;
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
        return {
            publicKey,
            signerAdapter,
        };
    },
);
