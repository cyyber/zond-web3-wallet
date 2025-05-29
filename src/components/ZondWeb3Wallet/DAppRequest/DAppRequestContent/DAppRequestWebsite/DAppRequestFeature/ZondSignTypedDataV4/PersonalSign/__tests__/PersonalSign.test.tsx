import { mockedStore } from "@/__mocks__/mockedStore";
import { StoreProvider } from "@/stores/store";
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PersonalSign from "../PersonalSign";
import userEvent from "@testing-library/user-event";

describe("PersonalSign", () => {
  afterEach(cleanup);

  const message =
    "0x506c65617365207369676e2074686973206d65737361676520746f20636f6e6669726d20796f7572206964656e746974792e";
  const fromAddress = "Z20D20b8026B8F02540246f58120ddAAf35AECD9B";

  const renderComponent = (mockedStoreValues = mockedStore()) =>
    render(
      <StoreProvider value={mockedStoreValues}>
        <MemoryRouter>
          <PersonalSign />
        </MemoryRouter>
      </StoreProvider>,
    );

  it("should render the personal sign component", () => {
    const expectedMessage =
      "Please sign this message to confirm your identity.";
    renderComponent(
      mockedStore({
        dAppRequestStore: {
          dAppRequestData: {
            params: [message, fromAddress],
          },
        },
      }),
    );

    expect(screen.getByText("From Address")).toBeInTheDocument();
    expect(
      screen.getByText("Z 20D20 b8026 B8F02 54024 6f581 20ddA Af35A ECD9B"),
    ).toBeInTheDocument();
    expect(screen.getByText("Message")).toBeInTheDocument();
    expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    const copyButton = screen.getByRole("button", { name: "Copy message" });
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

  it("should copy the message to clipboard", async () => {
    renderComponent(
      mockedStore({
        dAppRequestStore: {
          dAppRequestData: {
            params: [message, fromAddress],
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
    const copyButton = screen.getByRole("button", { name: "Copy message" });
    await userEvent.click(copyButton);
    expect(clipboardMock).toHaveBeenCalledTimes(1);
    expect(clipboardMock).toHaveBeenCalledWith(
      "Please sign this message to confirm your identity.",
    );
  });
});
