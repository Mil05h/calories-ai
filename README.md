# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```

# Calories AI

A web application that analyzes meals (via text descriptions and images) and provides nutritional information using OpenAI's GPT-4 Vision API.

## Features

- User authentication with Firebase Auth
- Meal nutrition analysis with OpenAI
- Support for both text descriptions and image uploads
- Structured nutritional data (calories, protein, carbs, fat)

## Tech Stack

- React + TypeScript + Vite for the frontend
- Firebase Authentication, Firestore, and Cloud Functions
- OpenAI API for meal analysis

## Setup and Installation

### Prerequisites

1. Node.js and npm
2. Firebase account
3. OpenAI API key

### Frontend Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Firebase Functions Setup

1. Navigate to the functions directory:
   ```
   cd functions
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Configure Firebase functions environment variables:
   ```
   firebase functions:config:set openai.apikey="your_openai_api_key"
   ```
5. Build and deploy the functions:
   ```
   npm run deploy
   ```

## Local Development with Emulators

1. Start Firebase emulators:
   ```
   firebase emulators:start
   ```
2. In a separate terminal, start the frontend development server:
   ```
   npm run dev
   ```

## Using the Meal Analysis Feature

1. Sign in to the application
2. Navigate to the meal analysis page
3. Enter a meal description or upload an image (or both)
4. Submit the form to receive nutritional analysis

## Security Considerations

- OpenAI API keys are managed securely on the server side using Firebase Functions
- User authentication is required to use the meal analysis feature
- Rate limiting can be implemented on the Firebase Functions to prevent abuse

## License

[Specify your license here]
