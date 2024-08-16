import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ZondWalletLogo from "../ZondWalletLogo";

jest.mock("@/router/router", () => ({
  ROUTES: { HOME: "/" },
}));

describe("ZondWalletLogo", () => {
  const renderComponent = (printDebug = false) => {
    const { debug } = render(
      <MemoryRouter>
        <ZondWalletLogo />
      </MemoryRouter>,
    );
    if (printDebug) debug();
  };

  it("should render the zond wallet component", () => {
    renderComponent();

    expect(screen.getByText("Zond")).toBeTruthy();
    expect(screen.getByText("Wallet")).toBeTruthy();
  });
});
