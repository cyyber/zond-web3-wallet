import { useStore } from "@/stores/store";
import { observer } from "mobx-react-lite";
import ZondSendTransactionForContent from "./ZondSendTransactionForContent/ZondSendTransactionForContent";
import { useEffect, useState } from "react";

export const SEND_TRANSACTION_TYPES = {
  CONTRACT_DEPLOYMENT: "CONTRACT_DEPLOYMENT",
  CONTRACT_INTERACTION: "CONTRACT_INTERACTION",
  ZND_TRANSFER: "ZND_TRANSFER",
  UNKNOWN: "UNKNOWN",
} as const;

const ZondSendTransaction = observer(() => {
  const { dAppRequestStore } = useStore();
  const { dAppRequestData } = dAppRequestStore;

  const [transactionHeading, setTransactionHeading] = useState("");
  const [transactionSubHeading, setTransactionSubHeading] = useState("");
  const [transactionType, setTransactionType] = useState<
    keyof typeof SEND_TRANSACTION_TYPES
  >(SEND_TRANSACTION_TYPES.UNKNOWN);

  useEffect(() => {
    const params = dAppRequestData?.params[0];
    if (!params || typeof params !== "object") {
      return;
    }
    const { to, value, data } = params;
    if (!to && data) {
      setTransactionHeading("Deploy a contract");
      setTransactionSubHeading("This site wants to deploy a contract");
      setTransactionType(SEND_TRANSACTION_TYPES.CONTRACT_DEPLOYMENT);
    } else if (to && data) {
      setTransactionHeading("Interact with a contract");
      setTransactionSubHeading("This site wants to interact with a contract");
      setTransactionType(SEND_TRANSACTION_TYPES.CONTRACT_INTERACTION);
    } else if (to && value && !data) {
      setTransactionHeading("Transfer ZND");
      setTransactionSubHeading("This site wants to send ZND");
      setTransactionType(SEND_TRANSACTION_TYPES.ZND_TRANSFER);
    }
  }, [dAppRequestData]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-2xl font-bold">{transactionHeading}</div>
        <div>{transactionSubHeading}</div>
      </div>
      <div className="flex flex-col gap-4">
        <ZondSendTransactionForContent transactionType={transactionType} />
      </div>
    </div>
  );
});

export default ZondSendTransaction;
