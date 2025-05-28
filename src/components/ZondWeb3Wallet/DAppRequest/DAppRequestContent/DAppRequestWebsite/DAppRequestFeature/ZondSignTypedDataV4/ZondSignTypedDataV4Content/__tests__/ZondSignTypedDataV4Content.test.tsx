import { mockedStore } from "@/__mocks__/mockedStore";
import { StoreProvider } from "@/stores/store";
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import ZondSignTypedDataV4Content from "../ZondSignTypedDataV4Content";

describe("ZondSignTypedDataV4Content", () => {
  afterEach(cleanup);

  const fromAddress = "Z20D20b8026B8F02540246f58120ddAAf35AECD9B";
  const msgParams = {
    types: {
      EIP712Domain: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "version",
          type: "string",
        },
        {
          name: "chainId",
          type: "uint256",
        },
        {
          name: "verifyingContract",
          type: "address",
        },
      ],
      Person: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "wallet",
          type: "address",
        },
      ],
      Mail: [
        {
          name: "from",
          type: "Person",
        },
        {
          name: "to",
          type: "Person",
        },
        {
          name: "contents",
          type: "string",
        },
      ],
    },
    primaryType: "Mail",
    domain: {
      name: "Ether Mail",
      version: "1",
      chainId: 1,
      verifyingContract: "ZCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    },
    message: {
      from: {
        name: "Cow",
        wallet: "ZCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "ZbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    },
  };

  const renderComponent = (mockedStoreValues = mockedStore()) =>
    render(
      <StoreProvider value={mockedStoreValues}>
        <MemoryRouter>
          <ZondSignTypedDataV4Content />
        </MemoryRouter>
      </StoreProvider>,
    );

  it("should render the zond sign typed data v4 content component", () => {
    renderComponent(
      mockedStore({
        dAppRequestStore: {
          dAppRequestData: {
            params: [fromAddress, msgParams],
          },
        },
      }),
    );

    expect(screen.getByText("From Address")).toBeInTheDocument();
    expect(
      screen.getByText("Z 20D20 b8026 B8F02 54024 6f581 20ddA Af35A ECD9B"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Name")).toHaveLength(3);
    expect(screen.getByText("Ether Mail")).toBeInTheDocument();
    expect(screen.getByText("Verifying Contract")).toBeInTheDocument();
    expect(
      screen.getByText("Z CcCCc cccCC CCcCC CCCCc CcCcc CcCCC cCccc ccccC"),
    ).toBeInTheDocument();
    expect(screen.getByText("Primary Type")).toBeInTheDocument();
    expect(screen.getByText("Mail")).toBeInTheDocument();
    expect(screen.getByText("Contents")).toBeInTheDocument();
    expect(screen.getByText("Hello, Bob!")).toBeInTheDocument();
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("Cow")).toBeInTheDocument();
    expect(screen.getAllByText("Account Address")).toHaveLength(2);
    expect(
      screen.getByText("Z CD2a3 d9F93 8E13C D947E c05Ab C7FE7 34Df8 DD826"),
    ).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(
      screen.getByText("Z bBbBB BBbbB BBbbb BbbBb bbbBB bBbbb bBbBb bBBbB"),
    ).toBeInTheDocument();
    const copyButton = screen.getByRole("button", {
      name: "Copy message data",
    });
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).toBeEnabled();
    expect(screen.getByText("Mnemonic Phrases")).toBeInTheDocument();
    const mnemonicPhrasesField = screen.getByRole("textbox", {
      name: "mnemonicPhrases",
    });
    expect(mnemonicPhrasesField).toBeInTheDocument();
    expect(mnemonicPhrasesField).toBeEnabled();
    expect(screen.getByText("Paste the mnemonic phrases")).toBeInTheDocument();
  });

  it("should shrink the expandable section on clicking", async () => {
    renderComponent(
      mockedStore({
        dAppRequestStore: {
          dAppRequestData: {
            params: [fromAddress, msgParams],
          },
        },
      }),
    );

    const accordionForDomain = screen.getByRole("button", {
      name: "Domain",
    });
    expect(accordionForDomain).toBeInTheDocument();
    expect(accordionForDomain).toBeEnabled();
    expect(screen.getAllByText("Name")).toHaveLength(3);
    expect(screen.getByText("Ether Mail")).toBeInTheDocument();
    expect(screen.getByText("Verifying Contract")).toBeInTheDocument();
    expect(
      screen.getByText("Z CcCCc cccCC CCcCC CCCCc CcCcc CcCCC cCccc ccccC"),
    ).toBeInTheDocument();
    await userEvent.click(accordionForDomain);
    expect(screen.getAllByText("Name")).toHaveLength(2);
    expect(screen.queryByText("Ether Mail")).not.toBeInTheDocument();
    expect(screen.queryByText("Verifying Contract")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Z CcCCc cccCC CCcCC CCCCc CcCcc CcCCC cCccc ccccC"),
    ).not.toBeInTheDocument();
    const accordionForMessage = screen.getByRole("button", {
      name: "Message",
    });
    expect(accordionForMessage).toBeInTheDocument();
    expect(accordionForMessage).toBeEnabled();
    expect(screen.getByText("Primary Type")).toBeInTheDocument();
    expect(screen.getByText("Mail")).toBeInTheDocument();
    expect(screen.getByText("Contents")).toBeInTheDocument();
    expect(screen.getByText("Hello, Bob!")).toBeInTheDocument();
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getAllByText("Name")).toHaveLength(2);
    expect(screen.getByText("Cow")).toBeInTheDocument();
    expect(screen.getAllByText("Account Address")).toHaveLength(2);
    expect(
      screen.getByText("Z CD2a3 d9F93 8E13C D947E c05Ab C7FE7 34Df8 DD826"),
    ).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(
      screen.getByText("Z bBbBB BBbbB BBbbb BbbBb bbbBB bBbbb bBbBb bBBbB"),
    ).toBeInTheDocument();
    await userEvent.click(accordionForMessage);
    expect(screen.queryByText("Primary Type")).not.toBeInTheDocument();
    expect(screen.queryByText("Mail")).not.toBeInTheDocument();
    expect(screen.queryByText("Contents")).not.toBeInTheDocument();
    expect(screen.queryByText("Hello, Bob!")).not.toBeInTheDocument();
    expect(screen.queryByText("From")).not.toBeInTheDocument();
    expect(screen.queryByText("Name")).not.toBeInTheDocument();
    expect(screen.queryByText("Cow")).not.toBeInTheDocument();
    expect(screen.queryByText("Account Address")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Z CD2a3 d9F93 8E13C D947E c05Ab C7FE7 34Df8 DD826"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("To")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Z bBbBB BBbbB BBbbb BbbBb bbbBB bBbbb bBbBb bBBbB"),
    ).not.toBeInTheDocument();
  });

  it("should copy the message data to clipboard", async () => {
    renderComponent(
      mockedStore({
        dAppRequestStore: {
          dAppRequestData: {
            params: [fromAddress, msgParams],
          },
        },
      }),
    );
    const clipboardMock = jest.fn().mockResolvedValue(void 0 as never);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: clipboardMock,
      },
      writable: true,
    });
    const copyButton = screen.getByRole("button", {
      name: "Copy message data",
    });
    await userEvent.click(copyButton);
    expect(clipboardMock).toHaveBeenCalledTimes(1);
    expect(clipboardMock).toHaveBeenCalledWith(
      '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Person":[{"name":"name","type":"string"},{"name":"wallet","type":"address"}],"Mail":[{"name":"from","type":"Person"},{"name":"to","type":"Person"},{"name":"contents","type":"string"}]},"primaryType":"Mail","domain":{"name":"Ether Mail","version":"1","chainId":1,"verifyingContract":"ZCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"},"message":{"from":{"name":"Cow","wallet":"ZCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"},"to":{"name":"Bob","wallet":"ZbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"},"contents":"Hello, Bob!"}}',
    );
  });
});
