# Naija Safety Hub

A multi-hazard citizen safety and emergency app for Nigeria.

## Architecture & Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: Firebase (Authentication & Cloud Firestore).
- **State Management**: React Context API (`AuthContext`, `StateContext`).
- **Animations**: Framer Motion.
- **Icons**: Lucide React.

## Firebase Collections

- `users`: User profiles with roles (Citizen, Responder, Admin).
- `agencies`: Emergency agencies filtered by state.
- `incidents`: Emergency reports submitted by citizens.
- `incidentUpdates`: Real-time updates on incidents by responders.
- `contentModules`: Educational safety modules.
- `lessons`: Detailed lessons under each module.
- `userLessonProgress`: Tracking user learning progress.

## Security Rules

- **Default Deny**: Only authenticated users can access data.
- **Role-Based Access**:
  - **Citizens**: Can only access their own reports and progress.
  - **Responders**: Can access incidents assigned to their state/agency.
  - **Admins**: Full read/write access to all collections.
- **Validation**: Strict schema validation for all writes.

## Running Locally

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file based on `.env.example` and fill in your Firebase credentials.
4. Run the development server: `npm run dev`.

## Deployment to Cloud Run

1. **Build the app**: `npm run build`.
2. **Setup Firebase**: Ensure your Firebase project is configured and you have the `firebase-applet-config.json` or environment variables set.
3. **Deploy**:
   - Use the AI Studio "Deploy to Cloud Run" feature.
   - Ensure the following environment variables are set in the Cloud Run configuration:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_FIRESTORE_DATABASE_ID`

## Modifying Content

- **Agencies**: Manage via the Admin Dashboard or directly in the `agencies` collection in Firestore.
- **Learning Content**: Add or edit `contentModules` and `lessons` in Firestore. The Admin Dashboard provides a basic interface for viewing these.
- **State Directory**: The "Know My Agencies" directory is dynamically populated from the `agencies` collection based on the selected state.
