const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");
const router = express.Router();

// CREATE a job
router.post("/", async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ all jobs (includes application count)
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();
    const counts = await Application.aggregate([
      { $group: { _id: "$job", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map(item => [String(item._id), item.count]));
    res.json(jobs.map(job => ({ ...job, applicationCount: countMap.get(String(job._id)) || 0 })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ one job
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: "Invalid job ID" });
  }
});

// UPDATE a job
router.put("/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a job and its related applications
router.delete("/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    await Application.deleteMany({ job: job._id });
    res.json({ message: "Job and its related applications deleted" });
  } catch (error) {
    res.status(400).json({ message: "Invalid job ID" });
  }
});

module.exports = router;
