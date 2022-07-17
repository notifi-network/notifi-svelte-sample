import type { NotifiService } from "@notifi-network/notifi-core";
import { NotifiAxiosService } from "@notifi-network/notifi-axios-adapter";
import { notifiConfigs } from "@notifi-network/notifi-axios-utils";

// Ask Notifi for the right values
export const DAPP_ADDRESS = 'ASK_NOTIFI_FOR_THIS_VALUE';
export const ENVIRONMENT = 'Development';

const { gqlUrl } = notifiConfigs(ENVIRONMENT);
export const notifiService: NotifiService = new NotifiAxiosService({ gqlUrl });
