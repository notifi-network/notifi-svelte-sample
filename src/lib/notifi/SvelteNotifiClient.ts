import type {
	BroadcastMessageInput,
	ClientBroadcastMessageInput,
	ClientCreateAlertInput,
	ClientCreateBonfidaAuctionSourceInput,
	ClientCreateMetaplexAuctionSourceInput,
	ClientDeleteAlertInput,
	ClientEnsureTargetGroupInput,
	ClientSendVerificationEmailInput,
	ClientUpdateAlertInput,
	CompleteLoginViaTransactionInput,
	CreateSourceInput,
	EmailTarget,
	Filter,
	NotifiClient,
	NotifiService,
	SmsTarget,
	TargetType,
	TelegramTarget,
	User
} from '@notifi-network/notifi-core';
import type { MessageSignerWalletAdapterProps } from '@solana/wallet-adapter-base';
import type { PublicKey } from '@solana/web3.js';

export class SvelteNotifiClient implements NotifiClient {
	dappAddress: string;
	publicKey: PublicKey;
	walletAddress: string;
	service: NotifiService;

	_clientRandomUuid = '';
	_token = '';
	_roles: ReadonlyArray<string> = [];

	constructor(dappAddress: string, publicKey: PublicKey, service: NotifiService) {
		this.dappAddress = dappAddress;
		this.publicKey = publicKey;
		this.walletAddress = publicKey.toBase58();
		this.service = service;
	}

	beginLoginViaTransaction = async () => {
		const result = await this.service.beginLogInByTransaction({
			walletAddress: this.walletAddress,
			walletBlockchain: 'SOLANA',
			dappAddress: this.dappAddress
		});

		const nonce = result?.nonce ?? undefined;
		if (nonce === undefined) {
			throw new Error('Failed to begin login process');
		}

		const ruuid = crypto.randomUUID();
		const encoder = new TextEncoder();
		const data = encoder.encode(`${nonce}${ruuid}`);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);

		this._clientRandomUuid = ruuid;
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
		const logValue = `Notifi Auth: 0x${hashHex}`;

		return { logValue };
	};

	broadcastMessage = async (
		input: ClientBroadcastMessageInput,
		signer: MessageSignerWalletAdapterProps
	) => {
		const { topic, subject, message, isHolderOnly, variables: extraVariables } = input;

		if (topic.topicName === null) {
			throw new Error('Invalid UserTopic');
		}

		let targetTemplates: BroadcastMessageInput['targetTemplates'];
		if (topic.targetTemplate !== null) {
			const value = topic.targetTemplate;
			targetTemplates = [
				{
					key: 'EMAIL',
					value
				},
				{
					key: 'SMS',
					value
				},
				{
					key: 'TELEGRAM',
					value
				}
			];
		}

		const variables = [
			{
				key: 'message',
				value: message
			},
			{
				key: 'subject',
				value: subject
			}
		];

		if (isHolderOnly && topic.targetCollections !== null) {
			variables.push({
				key: 'TargetCollection',
				value: JSON.stringify(topic.targetCollections)
			});
		}

		if (extraVariables !== undefined) {
			Object.keys(extraVariables).forEach((key) => {
				if (key !== 'message' && key !== 'subject' && key !== 'TargetCollection') {
					variables.push({
						key,
						value: extraVariables[key]
					});
				}
			});
		}

		const timestamp = Math.round(Date.now() / 1000);
		const signature = await this._signMessage({ timestamp, signer });
		const result = await this.service.broadcastMessage({
			topicName: topic.topicName,
			targetTemplates,
			timestamp,
			variables,
			walletBlockchain: 'OFF_CHAIN',
			signature
		});

		return result.id ?? null;
	};

	completeLoginViaTransaction = async (input: CompleteLoginViaTransactionInput) => {
		const ruuid = this._clientRandomUuid;
		if (ruuid === '') {
			throw new Error('Must call beginLoginViaTransaction first');
		}

		const { transactionSignature } = input;
		const result = await this.service.completeLogInByTransaction({
			walletAddress: this.walletAddress,
			walletBlockchain: 'SOLANA',
			dappAddress: this.dappAddress,
			randomUuid: ruuid,
			transactionSignature
		});

		this._handleLogInResult(result);

		return result;
	};

	fetchData = async () => {
		const [alerts, sources, sourceGroups, targetGroups, emailTargets, smsTargets, telegramTargets] =
			await Promise.all([
				this.service.getAlerts(),
				this.service.getSources(),
				this.service.getSourceGroups(),
				this.service.getTargetGroups(),
				this.service.getEmailTargets(),
				this.service.getSmsTargets(),
				this.service.getTelegramTargets()
			]);

		const filterIds = new Set<string | null>();
		const filters: Filter[] = [];
		sources
			.flatMap((source) => source?.applicableFilters ?? [])
			.forEach((filter) => {
				if (!filterIds.has(filter.id)) {
					filters.push(filter);
					filterIds.add(filter.id);
				}
			});

		return {
			alerts,
			filters,
			sources,
			sourceGroups,
			targetGroups,
			emailTargets,
			smsTargets,
			telegramTargets
		};
	};

	logIn = async (signer: MessageSignerWalletAdapterProps) => {
		if (signer === null || signer === undefined) {
			throw new Error('Signer cannot be null');
		}

		const timestamp = Math.round(Date.now() / 1000);
		const signature = await this._signMessage({
			timestamp,
			signer
		});

		const result = await this.service.logInFromDapp({
			walletPublicKey: this.walletAddress,
			dappAddress: this.dappAddress,
			timestamp,
			signature
		});

		await this._handleLogInResult(result);

		return result;
	};

	logOut = async () => {
		this.service.setJwt(null);
		this._token = '';
		this._roles = [];
	};

	createAlert = async (input: ClientCreateAlertInput) => {
		throw new Error('Unimplemented');
	};

	createSource = async (input: CreateSourceInput) => {
		throw new Error('Unimplemented');
	};

	createMetaplexAuctionSource = async (input: ClientCreateMetaplexAuctionSourceInput) => {
		throw new Error('Unimplemented');
	};

	createBonfidaAuctionSource = async (input: ClientCreateBonfidaAuctionSourceInput) => {
		throw new Error('Unimplemented');
	};

	deleteAlert = async (input: ClientDeleteAlertInput) => {
		throw new Error('Unimplemented');
	};

	getConfiguration = async () => {
		return await this.service.getConfigurationForDapp({
			dappAddress: this.dappAddress
		});
	};

	getTopics = async () => {
		if (this._roles.some((role) => role === 'UserMessenger')) {
			return await this.service.getTopics();
		} else {
			throw new Error('This user is not authorized for getTopics!');
		}
	};

	updateAlert = async (input: ClientUpdateAlertInput) => {
		throw new Error('Unimplemented!');
	};

	ensureTargetGroup = async (input: ClientEnsureTargetGroupInput) => {
		throw new Error('Unimplemented!');
	};

	sendEmailTargetVerification = async (input: ClientSendVerificationEmailInput) => {
		const { targetId } = input;
		const result = await this.service.sendEmailTargetVerificationRequest({
			targetId
		});

		const sentId = result?.id ?? null;
		if (sentId === null) {
			throw new Error('Problem requesting email verification');
		}

		return sentId;
	};

	_handleLogInResult = (user: User) => {
		const token = user.authorization?.token ?? null;
		this.service.setJwt(token);
		this._roles = user?.roles ?? [];
		this._token = '';
	};

	_signMessage = async (
		params: Readonly<{
			timestamp: number;
			signer: MessageSignerWalletAdapterProps;
		}>
	): Promise<string> => {
		const { timestamp, signer } = params;
		const messageBuffer = new TextEncoder().encode(
			`${SIGNING_MESSAGE} \n 'Nonce:' ${this.walletAddress}${
				this.dappAddress
			}${timestamp.toString()}`
		);

		const signedBuffer = await signer.signMessage(messageBuffer);
		const signature = Buffer.from(signedBuffer).toString('base64');
		return signature;
	};
}

const SIGNING_MESSAGE = `Sign in with Notifi \n
    No password needed or gas is needed. \n
    Clicking “Approve” only means you have proved this wallet is owned by you! \n
    This request will not trigger any transaction or cost any gas fees. \n
    Use of our website and service is subject to our terms of service and privacy policy. \n`;
