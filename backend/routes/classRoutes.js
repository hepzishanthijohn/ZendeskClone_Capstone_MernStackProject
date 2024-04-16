const express = require("express");
const router = express.Router();
const Sclass = require('../models/SclassSchema.js');
const Student = require('../models/StudentSchema.js');
const Course = require('../models/CourseSchema.js');
const Mentor = require('../models/MentorSchema.js');

router.post('/SclassCreate', async (req, res) => {
    try {
        const sclass = new Sclass({
            sclassName: req.body.sclassName,
            institution: req.body.adminID
        });

        const existingSclassByName = await Sclass.findOne({
            sclassName: req.body.sclassName,
            institution: req.body.adminID
        });

        if (existingSclassByName) {
            res.send({ message: 'Sorry this class name already exists' });
        }
        else {
            const result = await sclass.save();
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/SclassList/:id', async (req, res) => {
    try {
        let sclasses = await Sclass.find({ institution: req.params.id })
        if (sclasses.length > 0) {
            res.send(sclasses)
        } else {
            res.send({ message: "No sclasses found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
router.get("/Sclass/:id", async (req, res) => {
    try {
        let sclass = await Sclass.findById(req.params.id);
        if (sclass) {
            sclass = await sclass.populate("institution", "institutionName")
            res.send(sclass);
        }
        else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

router.get("/Sclass/Students/:id", async (req, res) => {
    try {
        let students = await Student.find({ sclassName: req.params.id })
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

router.delete("/Sclasses/:id", async (req, res) => {
    try {
        const deletedClasses = await Sclass.deleteMany({ institution: req.params.id });
        if (deletedClasses.deletedCount === 0) {
            return res.send({ message: "No classes found to delete" });
        }
        const deletedStudents = await Student.deleteMany({ institution: req.params.id });
        const deletedCourses = await Course.deleteMany({ institution: req.params.id });
        const deletedMentors = await Mentor.deleteMany({ institution: req.params.id });
        res.send(deletedClasses);
    } catch (error) {
        res.status(500).json(error);
    }
})
router.delete("/Sclass/:id", async (req, res) => {
    try {
        const deletedClass = await Sclass.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.send({ message: "Class not found" });
        }
        const deletedStudents = await Student.deleteMany({ sclassName: req.params.id });
        const deletedCourses = await Course.deleteMany({ sclassName: req.params.id });
        const deletedMentors = await Mentor.deleteMany({ teachSclass: req.params.id });
        res.send(deletedClass);
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;