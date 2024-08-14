# Threads

Threads is a mobile application that allows users to create and participate in topic-based discussions. The app provides a user-friendly interface, making it easy to connect people through shared interests.

## Usage Instructions

### Installing and Running the Application

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

4. To run the application as a website, follow these steps:

   ```sh
   # Install necessary dependencies
   npx expo install react-dom react-native-web @expo/metro-runtime

   # Start the development server
   npm run web
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

3. Start the server:
   ```sh
   npm start
   ```

### Environment Configuration

Ensure that you have configured the necessary environment variables for both the frontend and backend. Create a `.env` file in both directories and add the required environment variables as per the `.env.example` template if available.
