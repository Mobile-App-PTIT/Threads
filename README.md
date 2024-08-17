# Threads

Threads is an innovative mobile application designed to facilitate the creation and participation in topic-based discussions. By leveraging a user-friendly interface, Threads aims to seamlessly connect individuals who share common interests, fostering a sense of community and engagement. The application is meticulously crafted to ensure ease of use, enabling users to effortlessly navigate through various discussion threads, contribute their insights, and interact with like-minded individuals. Whether you are looking to join an existing conversation or initiate a new topic, Threads provides the perfect platform to engage in meaningful and organized discussions. With its robust features and intuitive design, Threads stands out as a premier solution for connecting people through shared passions and interests.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Usage Instructions](#usage-instructions)
  - [Installing and Running the Application](#installing-and-running-the-application)
    - [Database (MongoDB with Docker)](#database-mongodb-with-docker)
    - [Frontend (React Native)](#frontend-react-native)
    - [Backend (Node.js)](#backend-nodejs)
- [Contributing](#contributing)
- [Contact](#contact)
- [License](#license)

## Features

- Create and join topic-based discussions
- User-friendly interface
- Real-time notifications
- Secure authentication

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/)
- You have installed [React Native](https://reactnative.dev/)
- You have installed [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/). Make sure Docker is running on your machine and you have logged in to your Docker account.
- Use the terminal with PowerShell (for running the database with Docker)

## Usage Instructions

### Installing and Running the Application

#### Database (MongoDB with Docker)

1. Ensure Docker is running on your machine.

2. Clone the repository:

   ```sh
   git clone https://github.com/Mobile-App-PTIT/Threads.git
   ```

3. Navigate to the `database` directory:

   ```sh
   cd database
   ```

4. Start the MongoDB database with Docker Compose:

   ```sh
   ./config.ps1
   ```

   - Choose **`2`** to restore the data for the mongo container.
   - Choose **`3`** to create a new database for the mongo container.
     - Choose **`1`** to create a new database.
     - Choose **`2`** to run the mongo container with web interface for root user (Mongo Express). After that, you can use the following the url to access the web interface: [**`http://localhost:8081`**](http://localhost:8081).
     - Choose **`3`** to run the mongo container with web interface for dev user (Mongo Express). After that, you can use the following the url to access the web interface: [**`http://localhost:8081`**](http://localhost:8082).
       <br>

   **Note:**

   - You **`are not allowed`** run the database with the web interface for root user and dev user **`at the same time`**.
   - When you run the database with the web interface, you must use the following credentials to log in at the first time:
     - **Username:** `admin`
     - **Password:** `mlIm*mrAh@aYiE4hw`
   - You can connect to the MongoDB database using the following connection string: `mongodb://<username>:<password>@localhost:27018/`.
   - You should not use the **`root`** user for the application. Instead, use the **`dev`** user.
   - The information about the database is stored in the file `.env`.
   - For more information about the commands in `config.ps1`, see the [README.md](database/README.md) file in the `database` directory.

#### Frontend (React Native)

1. Navigate to the `frontend` directory:

   ```sh
   cd frontend
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Run the application on an emulator or a real device:

   ```sh
   npm run android   # For Android
   npm run ios       # For iOS
   ```

   or

   ```sh
   npx expo start
   ```

   Once the development server is running, you can scan the QR code with the Expo Go app on your phone to run the app on a physical device or press **`i`** to run the app on an iOS simulator or **`a`** to run the app on an Android emulator.

   <br>

4. To run the application as a website, follow these steps:

   ```sh
   # Install necessary dependencies
   npx expo install react-dom react-native-web @expo/metro-runtime

   # Start the development server
   npx expo start
   ```

   Once the development server is running, the easiest way to launch the app is on a physical device with Expo Go.
   To see the web app in action, press **`w`** in the terminal. It will open the web app in the default web browser.

#### Backend (Node.js)

1. Navigate to the `backend` directory:

   ```sh
   cd backend
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the backend server:

   ```sh
   npm start
   ```

## Contributing

To contribute to Threads, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`.
4. Push to the original branch: `git push origin <project_name>/<location>`.
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

## Contact

If you want to contact me, you can reach me at [your-email@example.com](mailto:your-email@example.com).

## License

This project uses the following license: [MIT License](LICENSE).
