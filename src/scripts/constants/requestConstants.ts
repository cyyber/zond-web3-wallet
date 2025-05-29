export const UNRESTRICTED_METHODS = Object.freeze({
  NET_VERSION: "net_version",
  WALLET_REVOKE_PERMISSIONS: "wallet_revokePermissions",
  ZOND_ACCOUNTS: "zond_accounts",
  ZOND_BLOCK_NUMBER: "zond_blockNumber",
  ZOND_CALL: "zond_call",
  ZOND_CHAIN_ID: "zond_chainId",
  ZOND_ESTIMATE_GAS: "zond_estimateGas",
  ZOND_GET_BALANCE: "zond_getBalance",
  ZOND_GET_BLOCK_BY_NUMBER: "zond_getBlockByNumber",
  ZOND_GET_CODE: "zond_getCode",
  ZOND_GET_TRANSACTION_BY_HASH: "zond_getTransactionByHash",
  ZOND_GET_TRANSACTION_COUNT: "zond_getTransactionCount",
  ZOND_GET_TRANSACTION_RECEIPT: "zond_getTransactionReceipt",
  ZOND_WEB3_WALLET_GET_PROVIDER_STATE: "zondWallet_getProviderState",
});

export const RESTRICTED_METHODS = Object.freeze({
  PERSONAL_SIGN: "personal_sign",
  ZOND_REQUEST_ACCOUNTS: "zond_requestAccounts",
  ZOND_SEND_TRANSACTION: "zond_sendTransaction",
  ZOND_SIGN_TYPED_DATA_V4: "zond_signTypedData_v4",
});

export const ALL_REQUEST_METHODS = Object.values({
  ...RESTRICTED_METHODS,
  ...UNRESTRICTED_METHODS,
});

export const METHOD_ERROR_CODES = Object.freeze({
  UNSUPPORTED_METHOD: 4001,
  UNAUTHORIZED_ACCOUNT: 4100,
});
