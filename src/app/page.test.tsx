import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

vi.mock("@/lib/lifiEarn", () => ({
  fetchEarnVaults: vi.fn().mockResolvedValue([]),
}));

import Home from "./page";

test("moves from sleeping to recommendation state", async () => {
  const user = userEvent.setup();

  render(<Home />);

  await user.click(screen.getByRole("button", { name: /wake it up/i }));

  expect(await screen.findByText(/wake-up plan/i)).toBeInTheDocument();
});
