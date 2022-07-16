<script lang="ts">
    import type { BaseWalletAdapter } from '@solana/wallet-adapter-base';
	import { clusterApiUrl } from '@solana/web3.js';
	import {
		WalletProvider,
		ConnectionProvider
	} from '@svelte-on-solana/wallet-adapter-ui';
    import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

	const localStorageKey = 'walletAdapter';
	const network = clusterApiUrl('devnet'); // localhost or mainnet

    const wallets: BaseWalletAdapter[] = [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
    ];
</script>

{#if wallets.length}
    <WalletProvider {localStorageKey} {wallets} autoConnect />
    <ConnectionProvider {network} />
    <div>
        <slot />
    </div>
{/if}
