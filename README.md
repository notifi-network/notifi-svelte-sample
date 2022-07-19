# notifi-svelte-sample

Proof of concept integration of Notifi into a SvelteKit app
Caveat Emptor: I'm new to SvelteKit, so please don't take this as an example of the right way to do something on Svelte. It should primarily serve to show that Notifi integration *can* be done.

## Starting up
```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Testing Subscriptions
- Naviate to the "Subscription Sample" page
- Input the right "dapp address" into the form
- Input an email address (optionally, telegram ID)
- Check the box that says "announcements"
- Press Submit
- Your debug data should now show that your alert was created.
