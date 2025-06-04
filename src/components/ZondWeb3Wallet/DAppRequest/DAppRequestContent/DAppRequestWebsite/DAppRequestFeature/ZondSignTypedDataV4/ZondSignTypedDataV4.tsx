import { observer } from "mobx-react-lite";
import ZondSignTypedDataV4Content from "./ZondSignTypedDataV4Content/ZondSignTypedDataV4Content";
import { useStore } from "@/stores/store";
import { RESTRICTED_METHODS } from "@/scripts/constants/requestConstants";
import PersonalSign from "./PersonalSign/PersonalSign";

const ZondSignTypedDataV4 = observer(() => {
  const { dAppRequestStore } = useStore();
  const { dAppRequestData } = dAppRequestStore;
  const method = dAppRequestData?.method;
  const isZondSignTypedDataV4 =
    method === RESTRICTED_METHODS.ZOND_SIGN_TYPED_DATA_V4;
  const isPersonalSign = method === RESTRICTED_METHODS.PERSONAL_SIGN;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-2xl font-bold">Signature Request</div>
        <div>Review and sign the below message data</div>
      </div>
      <div className="flex flex-col gap-4">
        {isZondSignTypedDataV4 && <ZondSignTypedDataV4Content />}
        {isPersonalSign && <PersonalSign />}
      </div>
    </div>
  );
});

export default ZondSignTypedDataV4;
