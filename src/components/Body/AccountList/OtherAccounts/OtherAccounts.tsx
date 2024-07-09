import { Account } from "@/components/Body/AccountList/Account/Account";
import { Label } from "@/components/ui/label";
import { useStore } from "@/stores/store";
import { observer } from "mobx-react-lite";

export const OtherAccounts = observer(() => {
  const { accountStore, zondStore } = useStore();
  const { activeAccount, setActiveAccount } = accountStore;
  const { accountAddress } = activeAccount;
  const { zondAccounts } = zondStore;
  const { accounts } = zondAccounts;

  const otherAccountsLabel = `${accountAddress ? "Other accounts" : "Accounts"} in the wallet`;
  const otherAccounts = Object.keys(accounts).filter(
    (account) => account !== accountAddress,
  );

  return (
    otherAccounts.length && (
      <>
        <Label className="text-secondary">{otherAccountsLabel}</Label>
        {otherAccounts.map((account) => (
          <Account
            onClickHandler={() => setActiveAccount(account)}
            buttonVariant="outline"
            key={account}
            account={account}
            accountStatus="other"
          />
        ))}
      </>
    )
  );
});
