import { Button } from "@/components/UI/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/UI/Form";
import { Input } from "@/components/UI/Input";
import { Label } from "@/components/UI/Label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/UI/Tooltip";
import { useStore } from "@/stores/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Buffer } from "buffer";
import { getHexSeedFromMnemonic } from "@/functions/getHexSeedFromMnemonic";
import StringUtil from "@/utilities/stringUtil";

const FormSchema = z.object({
  mnemonicPhrases: z.string().min(1, "Mnemonic phrases are required"),
});

const PersonalSign = observer(() => {
  const { zondStore, dAppRequestStore } = useStore();
  const { zondInstance, zondConnection } = zondStore;
  const { isConnected } = zondConnection;
  const {
    dAppRequestData,
    setOnPermissionCallBack,
    setCanProceed,
    addToResponseData,
    approvalProcessingStatus,
  } = dAppRequestStore;
  const { isProcessing } = approvalProcessingStatus;

  const params = dAppRequestData?.params;
  const challenge = Buffer.from(params?.[0]?.slice(2) ?? "", "hex").toString(
    "utf8",
  );
  const fromAddress = params?.[1] ?? "";
  const { prefix: prefixFromAddress, addressSplit: addressSplitFromAddress } =
    StringUtil.getSplitAddress(fromAddress);

  useEffect(() => {
    if (isConnected) {
      const onPermissionCallBack = async (hasApproved: boolean) => {
        if (hasApproved) {
          personalSign();
        }
      };
      setOnPermissionCallBack(onPermissionCallBack);
    }
  }, [isConnected]);

  const copyMessage = () => {
    navigator.clipboard.writeText(challenge);
  };

  const personalSign = async () => {
    try {
      const mnemonicPhrases = watch().mnemonicPhrases.trim();
      const addressFromMnemonic = zondInstance?.accounts.seedToAccount(
        getHexSeedFromMnemonic(mnemonicPhrases),
      )?.address;
      if (fromAddress !== addressFromMnemonic) {
        throw new Error("Mnemonic phrases did not match with the address");
      }
      const signature = zondInstance?.accounts.sign(
        params?.[0],
        getHexSeedFromMnemonic(mnemonicPhrases),
      )?.signature;
      if (signature) {
        addToResponseData({
          signature,
        });
      } else {
        throw new Error("Message data could not be signed");
      }
    } catch (error) {
      addToResponseData({ error });
    }
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onSubmit",
    defaultValues: {
      mnemonicPhrases: "",
    },
  });
  const {
    watch,
    control,
    formState: { isValid },
  } = form;

  useEffect(() => {
    setCanProceed(isValid);
  }, [isValid]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-md bg-muted p-2">
        <div className="flex flex-col gap-1">
          <div>From Address</div>
          <div className="w-64 font-bold text-secondary">{`${prefixFromAddress} ${addressSplitFromAddress.join(" ")}`}</div>
        </div>
        <div className="flex flex-col gap-1">
          <div>Message</div>
          <div className="flex gap-2">
            <div className="max-h-[8rem] w-full overflow-hidden break-words font-bold text-secondary">
              {challenge}
            </div>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    className="w-12 hover:text-secondary"
                    variant="outline"
                    size="icon"
                    aria-label="Copy message"
                    onClick={copyMessage}
                  >
                    <Copy size="18" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <Label>Copy Message</Label>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form
          name="zondSendTransactionContractDeployment"
          aria-label="zondSendTransactionContractDeployment"
          className="w-full"
        >
          <FormField
            control={control}
            name="mnemonicPhrases"
            render={({ field }) => (
              <FormItem>
                <Label>Mnemonic Phrases</Label>
                <FormControl>
                  <Input
                    {...field}
                    aria-label={field.name}
                    autoComplete="off"
                    disabled={isProcessing}
                    placeholder="Mnemonic Phrases"
                  />
                </FormControl>
                <FormDescription>Paste the mnemonic phrases</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
});

export default PersonalSign;
