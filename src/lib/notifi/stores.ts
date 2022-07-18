import { writable, derived } from 'svelte/store';
import type { PublicKey } from '@solana/web3.js';
import type { WalletAdapter, MessageSignerWalletAdapter } from '@solana/wallet-adapter-base';
import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
import type { InternalData, SvelteNotifiClientState } from './SvelteNotifiClient';
import { SvelteNotifiClient } from './SvelteNotifiClient';
import type { NotifiEnvironment } from '@notifi-network/notifi-axios-utils';
import { notifiConfigs } from '@notifi-network/notifi-axios-utils';
import { NotifiAxiosService } from '@notifi-network/notifi-axios-adapter';

export type AdapterValues = Readonly<{
	publicKey: PublicKey | null;
	signerAdapter: MessageSignerWalletAdapter | null;
}>;

const isMessageSigner = (adapter: WalletAdapter): adapter is MessageSignerWalletAdapter => {
	return (<MessageSignerWalletAdapter>adapter).signMessage !== undefined;
};

export const adapterValues = derived<typeof walletStore, AdapterValues>(walletStore, ($store) => {
	let publicKey: PublicKey | null = null;
	let signerAdapter: MessageSignerWalletAdapter | null = null;
	const adapter = $store?.adapter ?? null;
	if (adapter === null || adapter.publicKey === null) {
		publicKey = null;
		signerAdapter = null;
	} else {
		publicKey = adapter.publicKey;
		if (isMessageSigner(adapter)) {
			signerAdapter = adapter;
		} else {
			signerAdapter = null;
		}
	}
	return {
		publicKey,
		signerAdapter
	};
});

export const dappAddress = writable<string>('ASK_NOTIFI_FOR_THIS_VALUE');
export const notifiEnvironment = writable<NotifiEnvironment>('Development');
export const notifiService = derived(notifiEnvironment, ($notifiEnvironment) => {
	const { gqlUrl } = notifiConfigs($notifiEnvironment);
	return new NotifiAxiosService({ gqlUrl });
});

export const clientState = writable<SvelteNotifiClientState>({
	clientRandomUuid: null,
	token: null,
	roles: []
});

export const clientData = writable<InternalData | null>(null);

export const notifiClient = derived(
	[adapterValues, dappAddress, notifiService],
	([$adapterValues, $dappAddress, $notifiService]) => {
		if ($adapterValues.publicKey === null) {
			return null;
		}

		clientState.set({
			clientRandomUuid: null,
			token: null,
			roles: []
		});

		return new SvelteNotifiClient(
			$dappAddress,
			$adapterValues.publicKey,
			$notifiService,
			clientState,
			clientData
		);
	}
);
