const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
require("dotenv").config();

const resolvers = {
    Query: {
        // ✅ Login allows both username or email
        login: async (_, { username, password }) => {
            try {
                const user = await User.findOne({
                    $or: [{ username: username }, { email: username }]
                });

                if (!user) throw new Error("User not found");

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) throw new Error("Invalid credentials");

                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );

                return { token, user };
            } catch (error) {
                throw new Error(error.message);
            }
        },

        getAllEmployees: async (_, __, context) => {
            if (!context.user) throw new Error("Unauthorized! Please login.");
            return await Employee.find();
        },

        searchEmployeeById: async (_, { id }, context) => {
            if (!context.user) throw new Error("Unauthorized! Please login.");
            return await Employee.findById(id);
        },

        searchEmployeeByDesignation: async (_, { department, designation }, context) => {
            if (!context.user) throw new Error("Unauthorized! Please login.");
            const query = {};
            if (department) query.department = department;
            if (designation) query.designation = designation;
            return await Employee.find(query);
        }
    },

    Mutation: {
        // ✅ Signup now returns a token along with user details
        signup: async (_, { username, email, password }) => {
            try {
                const existingUser = await User.findOne({ email });
                if (existingUser) throw new Error("Email already in use!");

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                const user = new User({ username, email, password: hashedPassword });
                await user.save();

                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );

                return { token, user };
            } catch (error) {
                throw new Error(error.message);
            }
        },

        addEmployee: async (_, args, context) => {
            if (!context.user) throw new Error("Unauthorized! Please login.");
            try {
                const employee = new Employee(args);
                return await employee.save();
            } catch (error) {
                throw new Error("Error adding employee: " + error.message);
            }
        },

        updateEmployee: async (_, { id, ...updates }, context) => {
            if (!context.user) throw new Error("Unauthorized! Please login.");
            try {
                return await Employee.findByIdAndUpdate(id, updates, { new: true });
            } catch (error) {
                throw new Error("Error updating employee: " + error.message);
            }
        },

        deleteEmployee: async (_, { id }, context) => {
            if (!context.user) throw new Error("Unauthorized! Please login.");
            try {
                await Employee.findByIdAndDelete(id);
                return "Employee deleted successfully!";
            } catch (error) {
                throw new Error("Error deleting employee: " + error.message);
            }
        }
    }
};

module.exports = resolvers;
