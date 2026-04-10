const mongoose = require("mongoose");
const Department = require("./models/Department");
const Category = require("./models/Category");
require("dotenv").config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Seed Departments
    const depts = [
      { name: "Water Department", headName: "Mr. Sharma", contactEmail: "water@city.gov" },
      { name: "Electricity Department", headName: "Mr. Patel", contactEmail: "electricity@city.gov" },
      { name: "Sanitation Department", headName: "Mr. Gupta", contactEmail: "sanitation@city.gov" },
      { name: "Road & Infrastructure", headName: "Mr. Mehta", contactEmail: "roads@city.gov" },
      { name: "Fire Department", headName: "Chief Singh", contactEmail: "fire@city.gov" }
    ];

    for (const d of depts) {
      await Department.findOneAndUpdate({ name: d.name }, d, { upsert: true });
    }

    // Seed Categories
    const cats = [
      { name: "Drainage", subcategories: ["Manhole Cover Missing", "Drainage Overflow", "New Connection"] },
      { name: "Water", subcategories: ["Pipeline Leakage", "No Water Supply", "Dirty Water"] },
      { name: "Light", subcategories: ["Street Light Not Working", "Open Wire Danger", "New Pole Request"] },
      { name: "Road", subcategories: ["Potholes", "Speed breaker request", "Road Painting"] }
    ];

    for (const c of cats) {
      await Category.findOneAndUpdate({ name: c.name }, c, { upsert: true });
    }

    console.log("Seeding completed successfully!");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
