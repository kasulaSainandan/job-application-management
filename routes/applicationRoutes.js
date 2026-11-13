const express = require("express");
const mongoose = require("mongoose");
const Application = require("../models/Application");
const Job = require("../models/Job");
const router = express.Router();

// CREATE an application for an existing job
router.post("/", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.body.job)) {
      return res.status(400).json({ message: "A valid job ID is required" });
    }
    const jobExists = await Job.exists({ _id: req.body.job });
    if (!jobExists) return res.status(404).json({ message: "Referenced job not found" });
    const application = await Application.create(req.body);
    const populated = await application.populate("job", "title companyName location");
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ all applications, with linked job details
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("job", "title companyName location")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ applications for one job
router.get("/job/:jobId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    const applications = await Application.find({ job: req.params.jobId })
      .populate("job", "title companyName location")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE application details/status
router.put("/:id", async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate("job", "title companyName location");
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an application
router.delete("/:id", async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application deleted" });
  } catch (error) {
    res.status(400).json({ message: "Invalid application ID" });
  }
});

module.exports = router;
