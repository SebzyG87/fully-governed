import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Auth from "./Auth";

const mocks = vi.hoisted(() => ({
  resetPassword: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    resetPassword: mocks.resetPassword,
    verifyOtp: vi.fn(),
    resendVerification: vi.fn(),
    user: null,
    profile: null,
    loading: false,
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      updateUser: mocks.updateUser,
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn(),
      update: vi.fn().mockReturnThis(),
    })),
  },
}));

const renderAuth = (initialEntry = "/auth") => {
  window.history.pushState({}, "", initialEntry);

  return render(
    <MemoryRouter initialEntries={[initialEntry]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Auth", () => {
  beforeEach(() => {
    mocks.resetPassword.mockReset();
    mocks.updateUser.mockReset();
  });

  it("shows email, password, Google, and forgot-password login options", () => {
    renderAuth("/login");

    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /forgot your password/i })).toBeInTheDocument();
  });

  it("sends a password reset email from the forgot-password screen", async () => {
    mocks.resetPassword.mockResolvedValue(undefined);
    renderAuth("/auth");

    fireEvent.click(screen.getByRole("button", { name: /forgot your password/i }));
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "member@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => expect(mocks.resetPassword).toHaveBeenCalledWith("member@example.com"));
  });

  it("shows the recovery password form from Supabase recovery links", () => {
    renderAuth("/auth?type=recovery");

    expect(screen.getByText(/set your new access credentials/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update password/i })).toBeInTheDocument();
  });
});
