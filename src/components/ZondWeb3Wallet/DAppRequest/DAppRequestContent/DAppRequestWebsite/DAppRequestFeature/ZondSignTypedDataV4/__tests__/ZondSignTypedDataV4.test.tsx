import { mockedStore } from "@/__mocks__/mockedStore";
import { StoreProvider } from "@/stores/store";
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ZondSignTypedDataV4 from "../ZondSignTypedDataV4";

jest.mock(
  "../ZondSignTypedDataV4Content/ZondSignTypedDataV4Content",
  () => () => <div>Mocked Zond Sign Typed Data V4 Content</div>,
);
jest.mock("../PersonalSign/PersonalSign", () => () => (
  <div>Mocked Personal Sign</div>
));

describe("ZondSignTypedDataV4", () => {
  afterEach(cleanup);

  const renderComponent = (mockedStoreValues = mockedStore()) =>
    render(
      <StoreProvider value={mockedStoreValues}>
        <MemoryRouter>
          <ZondSignTypedDataV4 />
        </MemoryRouter>
      </StoreProvider>,
    );

  it("should render the ZondSignTypedDataV4Content component if the method is zond_signTypedData_v4", () => {
    renderComponent(
      mockedStore({
        dAppRequestStore: {
          dAppRequestData: {
            method: "zond_signTypedData_v4",
          },
        },
      }),
    );

    expect(screen.getByText("Signature Request")).toBeInTheDocument();
    expect(
      screen.getByText("Review and sign the below message data"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mocked Zond Sign Typed Data V4 Content"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Mocked Personal Sign")).not.toBeInTheDocument();
  });

  it("should render the PersonalSign component if the method is personal_sign", () => {
    renderComponent(
      mockedStore({
        dAppRequestStore: {
          dAppRequestData: {
            method: "personal_sign",
          },
        },
      }),
    );

    expect(screen.getByText("Signature Request")).toBeInTheDocument();
    expect(
      screen.getByText("Review and sign the below message data"),
    ).toBeInTheDocument();
    expect(screen.getByText("Mocked Personal Sign")).toBeInTheDocument();
    expect(
      screen.queryByText("Mocked Zond Sign Typed Data V4 Content"),
    ).not.toBeInTheDocument();
  });
});
