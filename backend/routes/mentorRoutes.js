const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const Mentor = require('../models/MentorSchema.js');
const Subject = require('../models/CourseSchema.js');

router.post('/MentorReg', async (req, res) => {
    const { name, email, password, role, institution, teachCourse, teachSclass } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const mentor = new Mentor({ name, email, password: hashedPass, role, institution, teachCourse, teachSclass });

        const existingMentorByEmail = await Mentor.findOne({ email });

        if (existingMentorByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else {
            let result = await mentor.save();
            await Subject.findByIdAndUpdate(teachCourse, { mentor: mentor._id });
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
router.post('/MentorLogin',  async (req, res) => {
    try {
        let mentor = await Mentor.findOne({ email: req.body.email });
        if (mentor) {
            const validated = await bcrypt.compare(req.body.password, mentor.password);
            if (validated) {
                mentor = await mentor.populate("teachCourse", "subName sessions")
                mentor = await mentor.populate("institution", "institutionName")
                mentor = await mentor.populate("teachSclass", "sclassName")
                mentor.password = undefined;
                res.send(mentor);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Mentor not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

router.get("/Mentors/:id", async (req, res) => {
    try {
        let mentors = await Mentor.find({ institution: req.params.id })
            .populate("teachCourse", "subName")
            .populate("teachSclass", "sclassName");
        if (mentors.length > 0) {
            let modifiedMentors = mentors.map((mentor) => {
                return { ...mentor._doc, password: undefined };
            });
            res.send(modifiedMentors);
        } else {
            res.send({ message: "No mentors found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
})
router.get("/Mentor/:id", async (req, res) => {
    try {
        let mentor = await Mentor.findById(req.params.id)
            .populate("teachCourse", "subName sessions")
            .populate("institution", "institutionName")
            .populate("teachSclass", "sclassName")
        if (mentor) {
            mentor.password = undefined;
            res.send(mentor);
        }
        else {
            res.send({ message: "No mentor found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

router.delete("/Mentors/:id", async (req, res) => {
    try {
        const deletionResult = await Mentor.deleteMany({ institution: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No mentors found to delete" });
            return;
        }

        const deletedMentors = await Mentor.find({ institution: req.params.id });

        await Subject.updateMany(
            { mentor: { $in: deletedMentors.map(mentor => mentor._id) }, mentor: { $exists: true } },
            { $unset: { mentor: "" }, $unset: { mentor: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
})
router.delete("/MentorsClass/:id", async (req, res) => {
    try {
        const deletionResult = await Mentor.deleteMany({ sclassName: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No mentors found to delete" });
            return;
        }

        const deletedMentors = await Mentor.find({ sclassName: req.params.id });

        await Subject.updateMany(
            { mentor: { $in: deletedMentors.map(mentor => mentor._id) }, mentor: { $exists: true } },
            { $unset: { mentor: "" }, $unset: { mentor: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
})
router.delete("/Mentor/:id", async (req, res) => {
    try {
        const deletedMentor = await Mentor.findByIdAndDelete(req.params.id);

        await Subject.updateOne(
            { mentor: deletedMentor._id, mentor: { $exists: true } },
            { $unset: { mentor: 1 } }
        );

        res.send(deletedMentor);
    } catch (error) {
        res.status(500).json(error);
    }
})

router.put("/MentorSubject", async (req, res) => {
    const { mentorId, teachCourse } = req.body;
    try {
        const updatedMentor = await Mentor.findByIdAndUpdate(
            mentorId,
            { teachCourse },
            { new: true }
        );

        await Subject.findByIdAndUpdate(teachCourse, { mentor: updatedMentor._id });

        res.send(updatedMentor);
    } catch (error) {
        res.status(500).json(error);
    }
})

router.post('/MentorAttendance/:id', async (req, res) => {
    const { status, date } = req.body;

    try {
        const mentor = await Mentor.findById(req.params.id);

        if (!mentor) {
            return res.send({ message: 'Mentor not found' });
        }

        const existingAttendance = mentor.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            mentor.attendance.push({ date, status });
        }

        const result = await mentor.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error)
    }
})




module.exports = router