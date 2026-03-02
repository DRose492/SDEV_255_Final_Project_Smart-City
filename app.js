// Fix DNS issues for Atlas
require('node:dns/promises').setServers(['1.1.1.1', '8.8.8.8']);

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const mongoose = require("mongoose");

// ----------------------
// CONNECT TO MONGODB ATLAS
// ----------------------
mongoose.connect(
  "mongodb+srv://smartcity:smartcity255@smartcityfinalproject.nicvwbc.mongodb.net/smartcityfinalproject?retryWrites=true&w=majority&appName=smartcityfinalproject"
)
.then(() => console.log("MongoDB connected (Atlas)"))
.catch(err => console.error("MongoDB connection error:", err));

const Course = require("./models/course");
const User = require("./models/user");

app.use(express.json());

// ----------------------
// LOGIN ROUTE
// ----------------------
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({
            email: user.email,
            role: user.role
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------
// COURSE ROUTES
// ----------------------
const router = express.Router();

// GET all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET one course
router.get('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a course
router.post('/courses', async (req, res) => {
    console.log("POST BODY:", req.body);

    const course = new Course({
        title: req.body.title,
        subject: req.body.subject,
        credits: req.body.credits,
        description: req.body.description,
        owner: req.body.owner
    });

    try {
        const newCourse = await course.save();
        res.status(201).json(newCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE a course
router.put('/courses/:id', async (req, res) => {
    console.log("PUT BODY:", req.body);

    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.owner !== req.body.owner) {
            return res.status(403).json({ message: 'Not allowed' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedCourse);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a course
router.delete('/courses/:id', async (req, res) => {
    console.log("DELETE BODY:", req.body);

    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.owner !== req.body.owner) {
            return res.status(403).json({ message: 'Not allowed' });
        }

        await course.deleteOne();
        res.status(200).json({ message: 'Course deleted successfully' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ----------------------
// STUDENT SCHEDULE ROUTES (Stage 2)
// ----------------------

// Get all courses a student is enrolled in
router.get("/student/courses", async (req, res) => {
    const email = req.query.email;

    try {
        const user = await User.findOne({ email }).populate("enrolledCourses");
        if (!user) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(user.enrolledCourses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a course to student's schedule
router.post("/student/courses", async (req, res) => {
    const { email, courseId } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (!user.enrolledCourses) {
            user.enrolledCourses = [];
        }

        // Avoid duplicates
        if (!user.enrolledCourses.includes(courseId)) {
            user.enrolledCourses.push(courseId);
            await user.save();
        }

        const populated = await user.populate("enrolledCourses");
        res.status(200).json(populated.enrolledCourses);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Drop a course from student's schedule
router.delete("/student/courses/:courseId", async (req, res) => {
    const { email } = req.body;
    const { courseId } = req.params;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Student not found" });
        }

        user.enrolledCourses = user.enrolledCourses.filter(
            (id) => id.toString() !== courseId
        );

        await user.save();

        const populated = await user.populate("enrolledCourses");
        res.status(200).json(populated.enrolledCourses);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Attach routes
app.use("/api", router);

// ----------------------
// START SERVER
// ----------------------
app.listen(3000, () => {
    console.log("listening");
});
