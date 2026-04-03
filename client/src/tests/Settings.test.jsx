import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Settings from "../pages/Settings";

// Mock Clerk hooks
jest.mock("@clerk/clerk-react", () => ({
  useUser: () => ({
    user: {
      id: "test_user",
      fullName: "Test Citizen",
      primaryEmailAddress: { emailAddress: "test@example.com" }
    }
  }),
  useAuth: () => ({
    getToken: jest.fn(() => Promise.resolve("mock_token"))
  })
}));

describe("Settings Component", () => {
  beforeEach(() => {
    // Mock global fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          userId: "test_user",
          notifications: { email: true, sms: false, inApp: true },
          appearance: { theme: "auto", density: "comfortable" },
          dashboard: { refreshInterval: 15, zoom: 11 },
          privacy: { shareAnonymized: false }
        }),
      })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders the settings layout after fetching data", async () => {
    render(<Settings />);
    
    // initially shows skeleton
    expect(document.querySelector(".skeleton-container")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("User Profile")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Citizen")).toBeInTheDocument(); // It's in the input but user event might be needed, or let's check field
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
  });

  it("switches tabs correctly", async () => {
    render(<Settings />);
    await waitFor(() => screen.getByText("Notifications"));

    fireEvent.click(screen.getByText("Notifications"));
    
    expect(screen.getByText("Email Notifications")).toBeInTheDocument();
    expect(screen.getByText("In-App Notifications")).toBeInTheDocument();
  });

  it("triggers API save on toggle change", async () => {
    render(<Settings />);
    await waitFor(() => screen.getByText("Notifications"));
    fireEvent.click(screen.getByText("Notifications"));

    const emailInput = document.getElementById("email-toggle");
    fireEvent.click(emailInput);

    await waitFor(() => {
      // It should trigger a second fetch call (PUT)
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
