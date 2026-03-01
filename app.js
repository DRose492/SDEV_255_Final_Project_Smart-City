require('node:dns/promises').setServers(['1.1.1.1', '8.8.8.8'])
const express = require("express")
const Course = require("./models/course")

const app = express()
app.use(express.json())

const router = express.Router()


router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.get('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.post('/courses', async (req, res) => {
    const course = new Course({
        title: req.body.title,
        subject: req.body.subject,
        credits: req.body.credits,
        description: req.body.description
    });
    try {
        const newCourse = await course.save();
        res.status(201).json(newCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

router.put('/courses/:id', async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedCourse) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(updatedCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

router.delete('/courses/:id', async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);
        if (!deletedCourse) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})


app.use("/api", router)
app.listen(3000, () => {
    console.log("listening")
})