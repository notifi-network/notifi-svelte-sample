<script lang="ts">
    import type { PublicKey } from '@solana/web3.js';
    import type { MessageSignerWalletAdapter } from '@solana/wallet-adapter-base';

    export let publicKey: PublicKey;
    export let adapter: MessageSignerWalletAdapter;

    let emailInput = '';
    let telegramInput = '';
    let announcementsSubscribed = false;

    const handleSubmit = () => {
        console.log(
            'Submit!',
            emailInput,
            telegramInput,
            announcementsSubscribed,
            publicKey,
            adapter);
    };
</script>

<div class="subscriptions">
    <h1>Subscription Sample</h1>

    <form>
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