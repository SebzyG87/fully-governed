import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({ useAuth: mocks.useAuth }));

import ProtectedRoute from "./ProtectedRoute";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mocks.useAuth.mockReset();
  });

  it("redirects logged-out visitors to sign in without rendering protected content", () => {
    mocks.useAuth.mockReturnValue({ user: null, studioRole: null, loading: false });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><div>Private dashboard</div></ProtectedRoute>} />
          <Route path="/auth" element={<div>Sign in page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Sign in page")).toBeInTheDocument();
    expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
  });
});
