import { JsonRpcMiddleware } from "@theqrl/zond-wallet-provider/json-rpc-engine";
import { providerErrors } from "@theqrl/zond-wallet-provider/rpc-errors";
import { Json, JsonRpcRequest } from "@theqrl/zond-wallet-provider/utils";
import browser from "webextension-polyfill";
import {
  METHOD_ERROR_CODES,
  UNRESTRICTED_METHODS,
} from "../constants/requestConstants";
import { EXTENSION_MESSAGES } from "../constants/streamConstants";
import StorageUtil from "@/utilities/storageUtil";

// a precheck to determine if the request can proceed
const checkRequestCanProceed = async (req: JsonRpcRequest<JsonRpcRequest>) => {
  const urlOrigin = new URL(req?.senderData?.url ?? "").origin;
  const connectedAccounts =
    (await StorageUtil.getConnectedAccountsData(urlOrigin))?.accounts ?? [];
  const hasConnectedAccounts = connectedAccounts.length > 0;
  if (!hasConnectedAccounts) {
    return {
      canProceed: false,
      proceedError: {
        code: METHOD_ERROR_CODES.UNAUTHORIZED_ACCOUNT,
        message: "The dApp is not connected to the Zond Web3 Wallet.",
      },
    };
  }
  return { canProceed: true, proceedError: { code: 0, message: "" } };
};

const getUnrestrictedMethodResult = async (
  req: JsonRpcRequest<JsonRpcRequest>,
) => {
  const tabId = req?.senderData?.tabId ?? 0;
  return await browser.tabs.sendMessage(tabId, {
    name: EXTENSION_MESSAGES.UNRESTRICTED_METHOD_CALLS,
    data: req,
  });
};

type UnrestrictedMethodValue =
  (typeof UNRESTRICTED_METHODS)[keyof typeof UNRESTRICTED_METHODS];

export const unrestrictedMethodsMiddleware: JsonRpcMiddleware<
  JsonRpcRequest,
  Json
> = async (req, res, next, end) => {
  const requestedMethod = req.method;
  if (
    Object.values(UNRESTRICTED_METHODS).includes(
      requestedMethod as UnrestrictedMethodValue,
    )
  ) {
    // check if the request can proceed
    const { canProceed, proceedError } = await checkRequestCanProceed(req);
    if (!canProceed) {
      res.error = providerErrors.custom({
        code: proceedError?.code ?? METHOD_ERROR_CODES.UNSUPPORTED_METHOD,
        message: proceedError?.message,
      });
      end();
      return;
    }

    try {
      res.result = await getUnrestrictedMethodResult(req);
    } catch (error: any) {
      res.error = providerErrors.unsupportedMethod({
        message: error?.message,
      });
    }
    end();
  } else {
    next();
  }
};
