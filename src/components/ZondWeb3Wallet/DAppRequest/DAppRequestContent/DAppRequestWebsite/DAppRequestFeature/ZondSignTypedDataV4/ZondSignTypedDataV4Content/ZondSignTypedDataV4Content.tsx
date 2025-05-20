import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/UI/Accordion";
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
import StringUtil from "@/utilities/stringUtil";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  mnemonicPhrases: z.string().min(1, "Mnemonic phrases are required"),
});

const ZondSignTypedDataV4Content = observer(() => {
  const { zondStore, dAppRequestStore } = useStore();
  const {
    // zondInstance, getGasFeeData,
    zondConnection,
  } = zondStore;
  const { isConnected } = zondConnection;
  const {
    dAppRequestData,
    setOnPermissionCallBack,
    setCanProceed,
    // addToResponseData,
    approvalProcessingStatus,
  } = dAppRequestStore;
  const { isProcessing } = approvalProcessingStatus;

  const params = dAppRequestData?.params;
  const fromAddress = params?.[0] ?? "";
  const { prefix: prefixFrom, addressSplit: addressSplitFrom } =
    StringUtil.getSplitAddress(fromAddress);
  const typedData = params?.[1];
  const name = typedData?.domain?.name;
  const verifyingContract = typedData?.domain?.verifyingContract ?? "";
  const {
    prefix: prefixVerifyingContract,
    addressSplit: addressSplitVerifyingContract,
  } = StringUtil.getSplitAddress(verifyingContract);
  const primaryType = typedData?.primaryType ?? "";
  const contents = typedData?.message?.contents ?? "";
  const fromName = typedData?.message?.from?.name ?? "";
  const fromWallet = typedData?.message?.from?.wallet ?? "";
  const { prefix: prefixFromWallet, addressSplit: addressSplitFromWallet } =
    StringUtil.getSplitAddress(fromWallet);
  const toName = typedData?.message?.to?.name ?? "";
  const toWallet = typedData?.message?.to?.wallet ?? "";
  const { prefix: prefixToWallet, addressSplit: addressSplitToWallet } =
    StringUtil.getSplitAddress(toWallet);

  useEffect(() => {
    if (isConnected) {
      console.log(
        ">>>>dAppRequestData\n",
        prefixFrom,
        addressSplitFrom,
        "\n",
        typedData,
      );
      const onPermissionCallBack = async (hasApproved: boolean) => {
        if (hasApproved) {
          // approved
        }
      };
      setOnPermissionCallBack(onPermissionCallBack);
    }
  }, [isConnected]);

  const copyMessageData = () => {
    navigator.clipboard.writeText(JSON.stringify(typedData));
  };

  // const signTypedDataV4 = async () => {
  //   const request = dAppRequestData?.params?.[0];
  //   const mnemonicPhrases = watch().mnemonicPhrases.trim();
  // };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    reValidateMode: "onSubmit",
    defaultValues: {
      mnemonicPhrases: "",
    },
  });
  const {
    // watch,
    control,
    formState: { isValid },
  } = form;

  useEffect(() => {
    setCanProceed(isValid);
  }, [isValid]);

  return (
    <div className="flex flex-col gap-6">
      <Accordion
        type="multiple"
        className="w-full space-y-6"
        defaultValue={["domain", "message"]}
      >
        <AccordionItem value="domain" className="border-b-0">
          <AccordionTrigger className="rounded-md bg-muted p-2">
            Domain
          </AccordionTrigger>
          <AccordionContent className="mt-2 rounded-md bg-muted p-2 text-xs">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div>Name</div>
                <div className="font-bold text-secondary">{name}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div>Verifying Contract</div>
                <div className="font-bold text-secondary">
                  {`${prefixVerifyingContract} ${addressSplitVerifyingContract.join(" ")}`}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="message" className="border-b-0">
          <AccordionTrigger className="rounded-md bg-muted p-2">
            Message
          </AccordionTrigger>
          <AccordionContent className="mt-2 rounded-md bg-muted p-2 text-xs">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <div>Primary Type</div>
                  <div className="font-bold text-secondary">{primaryType}</div>
                </div>
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        className="w-10 hover:text-secondary"
                        variant="outline"
                        size="icon"
                        onClick={copyMessageData}
                      >
                        <Copy size="18" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <Label>Copy Message Data</Label>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex flex-col gap-1">
                <div>Contents</div>
                <div className="font-bold text-secondary">{contents}</div>
              </div>
              <div className="flex flex-col">
                <div>From</div>
                <div className="ml-6 flex flex-col gap-1">
                  <div>Name</div>
                  <div className="font-bold text-secondary">{fromName}</div>
                  <div>Account address</div>
                  <div className="font-bold text-secondary">
                    {`${prefixFromWallet} ${addressSplitFromWallet.join(" ")}`}
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div>To</div>
                <div className="ml-6 flex flex-col gap-1">
                  <div>Name</div>
                  <div className="font-bold text-secondary">{toName}</div>
                  <div>Account address</div>
                  <div className="font-bold text-secondary">
                    {`${prefixToWallet} ${addressSplitToWallet.join(" ")}`}
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
                <Label>Mnemonic phrases</Label>
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

export default ZondSignTypedDataV4Content;
