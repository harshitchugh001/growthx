const Assignment = require('../Model/Assignment');
const User = require('../Model/UserSchema');
const mongoose = require("mongoose");


exports.upload = async (req, res) => {
    const { adminId, task } = req.body;
    console.log(req.user);

    if (!adminId || !task) {
        return res.status(400).json({ message: 'Admin ID and task are required' });
    }

    try {
        const assignment = new Assignment({
            userId: new mongoose.Types.ObjectId(req.user.userId), 
            adminId: new mongoose.Types.ObjectId(adminId),
            task,
        });

        await assignment.save();

        res.status(201).json({ message: 'Assignment uploaded successfully', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading assignment', error: error.message });
    }
};


exports.getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'Admin' }).select('-password'); 
        res.status(200).json({ message: 'Admins fetched successfully', admins });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admins', error: error.message });
    }
};



exports.getAssignments = async (req, res) => {
    try {
        const { userId, role } = req.user;

        if (role !== "Admin") {
            return res.status(403).json({ message: "Unauthorized access. Admins only." });
        }

        const assignments = await Assignment.find({ adminId: userId }).populate("userId", "name email");

        if (assignments.length === 0) {
            return res.status(404).json({ message: "No assignments found." });
        }

        res.status(200).json({ message: "Assignments fetched successfully", data: assignments });
    } catch (error) {
        res.status(500).json({ message: "Error fetching assignments", error: error.message });
    }
};


exports.acceptAssignment = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const { id } = req.params;

        if (role !== "Admin") {
            return res.status(403).json({ message: "Unauthorized access. Admins only." });
        }

        const assignment = await Assignment.findOne({ _id: id, adminId: userId });

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found or unauthorized access." });
        }
        if (assignment.status == "Rejected") {
            return res.status(400).json({ message: `Assignment is already ${assignment.status}.` });
        }


        assignment.status = "Accepted";
        await assignment.save();

        res.status(200).json({ message: "Assignment accepted successfully", data: assignment });
    } catch (error) {
        res.status(500).json({ message: "Error accepting assignment", error: error.message });
    }
};


exports.rejectAssignment = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const { id } = req.params;

        if (role !== "Admin") {
            return res.status(403).json({ message: "Unauthorized access. Admins only." });
        }

        const assignment = await Assignment.findOne({ _id: id, adminId: userId });

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found or unauthorized access." });
        }

        if (assignment.status == "Accepted") {
            return res.status(400).json({ message: `Assignment is already ${assignment.status}.` });
        }

        assignment.status = "Rejected";
        await assignment.save();

        res.status(200).json({ message: "Assignment rejected successfully", data: assignment });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting assignment", error: error.message });
    }
};