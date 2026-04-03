const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const settingsRoutes = require("../routes/settingsRoutes");
const UserSettings = require("../models/UserSettings");

// Mock the clerkMiddleware and requireAuth
jest.mock("@clerk/express", () => {
  return {
    clerkMiddleware: () => (req, res, next) => next(),
    requireAuth: () => (req, res, next) => {
      // Mock an authenticated user
      req.auth = { userId: "test_clerk_user_id" };
      next();
    }
  };
});

const app = express();
app.use(express.json());
app.use("/api/settings", settingsRoutes);

describe("Settings API Endpoints", () => {
  beforeAll(async () => {
    // Setup a very simple mocked memory/test db scenario if running in real env,
    // but here we just mock the mongoose model completely
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/settings", () => {
    it("should create default settings if none exist and return 200", async () => {
      jest.spyOn(UserSettings, "findOne").mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue({
        userId: "test_clerk_user_id",
        notifications: { email: true }
      });
      jest.spyOn(UserSettings.prototype, "save").mockImplementation(saveMock);

      const res = await request(app).get("/api/settings");
      expect(res.statusCode).toEqual(200);
      expect(UserSettings.findOne).toHaveBeenCalledWith({ userId: "test_clerk_user_id" });
      expect(saveMock).toHaveBeenCalled();
    });

    it("should return existing settings", async () => {
      const mockSettings = { userId: "test_clerk_user_id", notifications: { email: false } };
      jest.spyOn(UserSettings, "findOne").mockResolvedValue(mockSettings);

      const res = await request(app).get("/api/settings");
      expect(res.statusCode).toEqual(200);
      expect(res.body.notifications.email).toBe(false);
    });
  });

  describe("PUT /api/settings", () => {
    it("should update and return new settings", async () => {
      const mockUpdated = { userId: "test_clerk_user_id", appearance: { theme: "dark" } };
      jest.spyOn(UserSettings, "findOneAndUpdate").mockResolvedValue(mockUpdated);

      const payload = { appearance: { theme: "dark" } };
      const res = await request(app).put("/api/settings").send(payload);

      expect(res.statusCode).toEqual(200);
      expect(res.body.appearance.theme).toBe("dark");
    });

    it("should fail validation on incorrect theme", async () => {
      const payload = { appearance: { theme: "neon_rainbow" } };
      const res = await request(app).put("/api/settings").send(payload);

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });
  });
});
