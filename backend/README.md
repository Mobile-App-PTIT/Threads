# API Documentation

## Introduction

This project provides a set of APIs for Threads, a social media platform. The APIs are built using [Node.js](https://nodejs.org/) and [Express.js](https://expressjs.com/).

The server will run on `http://localhost:3000`.

## List of APIs

### Route Auth

#### Login

- **Description**: Authenticate a user with the given email and password.
- **URL**: `http://localhost:3000/auth/login`
- **Method**: `POST`
- **Body**:

  - `email` (string): User's email (required, valid format).
  - `password` (string): User's password (required, at least 8 characters).

#### Signup

- **Description**: Create a new user with the given information.
- **URL**: `http://localhost:3000/auth/signup`
- **Method**: `POST`
- **Body**:

  - `name` (string): User's name (required, 3 to 50 characters).
  - `email` (string): User's email (required, valid format).
  - `password` (string): User's password (required, at least 8 characters).

#### Refresh Token

- **Description**: Refresh the user's access token.
- **URL**: `http://localhost:3000/auth/refresh-token`
- **Method**: `POST`
- **Body**:

  - `refreshToken` (string): User's refresh token (required).

### Route User

#### Get User Information

- **Description**: Get user information by ID.
- **URL**: `http://localhost:3000/user/:id`
- **Method**: `GET`
- **Parameters**:

  - `id` (string): User's ID (required).

#### Update User Information

- **Description**: Update user information by ID.
- **URL**: `http://localhost:3000/user/:id`
- **Method**: `PUT`
- **Parameters**:

  - `id` (string): User's ID (required).

- **Body**:

  - `name` (string): User's name (optional, 3 to 50 characters).
  - `bio` (string): User's bio (optional, up to 160 characters).
  - `email` (string): User's email (optional, valid format).
  - `image` (string): User's image URL (optional, valid format).

#### Delete a User

- **Description**: Delete a user by ID.
- **URL**: `http://localhost:3000/user/:id`
- **Method**: `DELETE`
- **Parameters**:

  - `id` (string): User's ID (required).

#### Get user's followers

- **Description**: Get user's followers by ID.
- **URL**: `http://localhost:3000/user/followers/:id`
- **Method**: `GET`
- **Parameters**:

  - `id` (string): User's ID (required).

#### Get user's following

- **Description**: Get user's following by ID.
- **URL**: `http://localhost:3000/user/following/:id`
- **Method**: `GET`
- **Parameters**:

  - `id` (string): User's ID (required).

## Conclusion

This document provides a basic guide to using the project's APIs. If you have any questions, please contact us.
