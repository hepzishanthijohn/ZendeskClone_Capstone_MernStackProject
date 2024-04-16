const express = require("express");
const router = express.Router();
const Course = require('../models/CourseSchema.js');
const Mentor = require('../models/MentorSchema.js');
const Student = require('../models/StudentSchema.js');


router.post('/CourseCreate', async (req, res) => {
    try {
        const courses = req.body.courses.map((course) => ({
            courseName: course.courseName,
            courseCode: course.courseCode,
            sessions: course.sessions,
        }));

        const existingCourseBySubCode = await Course.findOne({
            'courses.courseCode': courses[0].courseCode,
            institution: req.body.adminID,
        });

        if (existingCourseBySubCode) {
            res.send({ message: 'Sorry this subcode must be unique as it already exists' });
        } else {
            const newCourses = courses.map((course) => ({
                ...course,
                sclassName: req.body.sclassName,
                institution: req.body.adminID,
            }));

            const result = await Course.insertMany(newCourses);
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/AllCourses/:id', async (req, res) => {
    try {
        let courses = await Course.find({ institution: req.params.id })
            .populate("sclassName", "sclassName")
        if (courses.length > 0) {
            res.send(courses)
        } else {
            res.send({ message: "No courses found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
router.get('/ClassCourses/:id', async (req, res) => {
    try {
        let courses = await Course.find({ sclassName: req.params.id })
        if (courses.length > 0) {
            res.send(courses)
        } else {
            res.send({ message: "No courses found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
router.get('/FreeCourseList/:id', async (req, res) => {
    try {
        let courses = await Course.find({ sclassName: req.params.id, mentor: { $exists: false } });
        if (courses.length > 0) {
            res.send(courses);
        } else {
            res.send({ message: "No courses found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
router.get("/Course/:id", async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);
        if (course) {
            course = await course.populate("sclassName", "sclassName")
            course = await course.populate("mentor", "name")
            res.send(course);
        }
        else {
            res.send({ message: "No course found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

router.delete("/Course/:id", async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);

        // Set the teachCourse field to null in mentors
        await Mentor.updateOne(
            { teachCourse: deletedCourse._id },
            { $unset: { teachCourse: "" }, $unset: { teachCourse: null } }
        );

        // Remove the objects containing the deleted course from students' examResult array
        await Student.updateMany(
            {},
            { $pull: { examResult: { courseName: deletedCourse._id } } }
        );

        // Remove the objects containing the deleted course from students' attendance array
        await Student.updateMany(
            {},
            { $pull: { attendance: { courseName: deletedCourse._id } } }
        );

        res.send(deletedCourse);
    } catch (error) {
        res.status(500).json(error);
    }
})
router.delete("/Courses/:id", async (req, res) => {
    try {
        const deletedCourses = await Course.deleteMany({ institution: req.params.id });

        // Set the teachCourse field to null in mentors
        await Mentor.updateMany(
            { teachCourse: { $in: deletedCourses.map(course => course._id) } },
            { $unset: { teachCourse: "" }, $unset: { teachCourse: null } }
        );

        // Set examResult and attendance to null in all students
        await Student.updateMany(
            {},
            { $set: { examResult: null, attendance: null } }
        );

        res.send(deletedCourses);
    } catch (error) {
        res.status(500).json(error);
    }
})
router.delete("/CoursesClass/:id", async (req, res) => {
    try {
        const deletedCourses = await Course.deleteMany({ sclassName: req.params.id });

        // Set the teachCourse field to null in mentors
        await Mentor.updateMany(
            { teachCourse: { $in: deletedCourses.map(course => course._id) } },
            { $unset: { teachCourse: "" }, $unset: { teachCourse: null } }
        );

        // Set examResult and attendance to null in all students
        await Student.updateMany(
            {},
            { $set: { examResult: null, attendance: null } }
        );

        res.send(deletedCourses);
    } catch (error) {
        res.status(500).json(error);
    }
})




module.exports = router;