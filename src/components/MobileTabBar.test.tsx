import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MobileTabBar from "./MobileTabBar";

const mocks = vi.hoisted(() => ({ useAuth: vi.fn() }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: mocks.useAuth }));

describe("MobileTabBar", () => {
  beforeEach(() => {
    mocks.useAuth.mockReset();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
  });

  it("shows Gallery and Sign In instead of Dashboard to logged-out visitors", async () => {
    mocks.useAuth.mockReturnValue({ user: null });
    render(<MemoryRouter><MobileTabBar /></MemoryRouter>);

    expect(await screen.findByRole("link", { name: /gallery/i })).toHaveAttribute("href", "/360-tour");
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/auth");
    expect(screen.queryByRole("link", { name: /dashboard/i })).not.toBeInTheDocument();
  });

  it("shows Dashboard only when signed in", async () => {
    mocks.useAuth.mockReturnValue({ user: { id: "member-1" } });
    render(<MemoryRouter><MobileTabBar /></MemoryRouter>);

    expect(await screen.findByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/dashboard");
  });
});
