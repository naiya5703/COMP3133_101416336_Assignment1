const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        id: ID!
        username: String!
        email: String!
        created_at: String
    }

    type Employee {
        id: ID!
        first_name: String!
        last_name: String!
        email: String!
        gender: String!
        designation: String!
        salary: Float!
        date_of_joining: String!
        department: String!
        employee_photo: String
    }

    # New type to return both token and user
    type AuthPayload {
        token: String!
        user: User!
    }

    type Query {
        # Modify login return type to return AuthPayload (token + user)
        login(username: String!, password: String!): AuthPayload

        getAllEmployees: [Employee]
        searchEmployeeById(id: ID!): Employee
        searchEmployeeByDesignation(department: String, designation: String): [Employee]
    }

    type Mutation {
        signup(username: String!, email: String!, password: String!): AuthPayload
        addEmployee(first_name: String!, last_name: String!, email: String!, gender: String!, designation: String!, salary: Float!, date_of_joining: String!, department: String!, employee_photo: String): Employee
        updateEmployee(id: ID!, first_name: String, last_name: String, email: String, designation: String, salary: Float, department: String): Employee
        deleteEmployee(id: ID!): String
    }
`;

module.exports = typeDefs;

