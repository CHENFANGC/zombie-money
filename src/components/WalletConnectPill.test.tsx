import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

const disconnect = vi.fn();

vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: {
    Custom:
      ({ children }: { children: (props: Record<string, unknown>) => React.ReactNode }) =>
        children({
          account: {
            displayName: "0xFd...29Ab",
            address: "0xFd00000000000000000000000000000000029Ab",
          },
          chain: {
            unsupported: false,
          },
          mounted: true,
          openAccountModal: vi.fn(),
          openConnectModal: vi.fn(),
          openChainModal: vi.fn(),
        }),
  },
}));

vi.mock("wagmi", () => ({
  useDisconnect: () => ({
    disconnect,
  }),
}));

import { WalletConnectPill } from "./WalletConnectPill";

test("opens an account menu and disconnects from the custom wallet menu", async () => {
  const user = userEvent.setup();

  render(<WalletConnectPill />);

  await user.click(screen.getByRole("button", { name: /0xfd...29ab/i }));

  await user.click(screen.getByRole("button", { name: /disconnect/i }));

  expect(disconnect).toHaveBeenCalledTimes(1);
});
