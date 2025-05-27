import StorageUtil from "@/utilities/storageUtil";
import { JsonRpcMiddleware } from "@theqrl/zond-wallet-provider/json-rpc-engine";
import { providerErrors } from "@theqrl/zond-wallet-provider/rpc-errors";
import { Json, JsonRpcRequest } from "@theqrl/zond-wallet-provider/utils";
import browser from "webextension-polyfill";
import {
  METHOD_ERROR_CODES,
  RESTRICTED_METHODS,
} from "../constants/requestConstants";
import { EXTENSION_MESSAGES } from "../constants/streamConstants";
import { DAppRequestType, DAppResponseType } from "./middlewareTypes";

// a precheck to determine if the request can proceed
const checkRequestCanProceed = async (req: JsonRpcRequest<JsonRpcRequest>) => {
  let signingFromAddress = "";
  switch (req.method) {
    case RESTRICTED_METHODS.ZOND_SIGN_TYPED_DATA_V4:
    case RESTRICTED_METHODS.PERSONAL_SIGN:
      signingFromAddress =
        req.method === RESTRICTED_METHODS.ZOND_SIGN_TYPED_DATA_V4
          ? // @ts-ignore
            req.params?.[0]
          : // @ts-ignore
            req.params?.[1];
      const urlOrigin = new URL(req?.senderData?.url ?? "").origin;
      const connectedAccounts =
        await StorageUtil.getConnectedAccountsData(urlOrigin);
      const hasFromAddressConnected =
        connectedAccounts?.accounts.includes(signingFromAddress) ?? false;
      return {
        canProceed: hasFromAddressConnected,
        proceedError: {
          code: METHOD_ERROR_CODES.UNAUTHORIZED_ACCOUNT,
          message: `The requested account ${signingFromAddress} has not been authorized by the user.`,
        },
      };
    default:
      return { canProceed: true, proceedError: { code: 0, message: "" } };
  }
};

// get the result of the user approval/rejection of the request
const getRestrictedMethodResult = async (
  req: JsonRpcRequest<JsonRpcRequest>,
): Promise<DAppResponseType> => {
  return new Promise(async (resolve) => {
    const request: DAppRequestType = {
      method: req.method,
      params: req.params,
      requestData: { senderData: req.senderData },
    };

    await StorageUtil.setDAppRequestData(request);
    try {
      await browser.action.openPopup();
    } catch (error) {
      console.warn("ZondWeb3Wallet: Could not open the wallet");
    }

    const handleMessage = function messageHandler(message: DAppResponseType) {
      if (message.action === EXTENSION_MESSAGES.DAPP_RESPONSE) {
        // Remove the listener when the message is processed
        browser.runtime.onMessage.removeListener(handleMessage);
        resolve(message);
      }
    };
    // Listen for the approval/rejection from the UI
    browser.runtime.onMessage.addListener(handleMessage);
  });
};

let isRequestPending = false;

type RestrictedMethodValue =
  (typeof RESTRICTED_METHODS)[keyof typeof RESTRICTED_METHODS];

export const restrictedMethodsMiddleware: JsonRpcMiddleware<
  JsonRpcRequest,
  Json
> = async (req, res, next, end) => {
  const requestedMethod = req.method;
  if (
    Object.values(RESTRICTED_METHODS).includes(
      requestedMethod as RestrictedMethodValue,
    )
  ) {
    if (isRequestPending) {
      try {
        await browser.action.openPopup();
      } finally {
        res.error = providerErrors.unsupportedMethod({
          message: "A request is already pending",
        });
      }
      end();
    } else {
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

      // open the popup and wait for the user to approve/reject the request
      let restrictedMethodResult: DAppResponseType = {
        method: "",
        action: "",
        hasApproved: false,
      };
      try {
        isRequestPending = true;
        restrictedMethodResult = await getRestrictedMethodResult(req);
      } finally {
        isRequestPending = false;
        const hasApproved = restrictedMethodResult?.hasApproved;
        if (hasApproved) {
          switch (restrictedMethodResult?.method) {
            case RESTRICTED_METHODS.ZOND_REQUEST_ACCOUNTS:
              const urlOrigin = new URL(req?.senderData?.url ?? "").origin;
              const accounts: string[] =
                restrictedMethodResult?.response?.accounts;
              await StorageUtil.setConnectedAccountsData({
                urlOrigin,
                accounts,
              });
              res.result = accounts;
              break;
            case RESTRICTED_METHODS.ZOND_SEND_TRANSACTION:
              const transactionHash =
                restrictedMethodResult?.response?.transactionHash;
              if (transactionHash) {
                res.result = transactionHash;
              } else {
                res.error = providerErrors.unsupportedMethod({
                  message: restrictedMethodResult?.response?.error?.message,
                  data: restrictedMethodResult?.response?.error,
                });
              }
              break;
            case RESTRICTED_METHODS.ZOND_SIGN_TYPED_DATA_V4:
            case RESTRICTED_METHODS.PERSONAL_SIGN:
              const signature = restrictedMethodResult?.response?.signature;
              if (signature) {
                res.result = signature;
              } else {
                res.error = providerErrors.unsupportedMethod({
                  message: restrictedMethodResult?.response?.error?.message,
                  data: restrictedMethodResult?.response?.error,
                });
              }
              break;
            default:
              res.error = providerErrors.unsupportedMethod();
              break;
          }
        } else {
          res.error = providerErrors.userRejectedRequest();
        }
      }
      end();
    }
  } else {
    next();
  }
};
