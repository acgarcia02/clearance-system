# College Clearance System

## Prerequisites

- Node.js (v19.8.1)
- npm (>=v9.6.6)
- MongoDB (>=v5.0)
- Vercel account

## Instructions

1. Clone the repository
2. Navigate to the project directory

```
cd cas-clearance
```

3. Run the following command to install dependencies for the server:

```
cd backend
npm install
```

4. Run the following command to install dependencies for the client:

```
cd ../frontend
npm install
```

5. Run the following command to start the server:

```
cd backend
npm start
```

6. Run the following command to start the client:

```
cd ../frontend
npm start
```

7. Configure environment variables and Google API credentials.
   Sample .env file in backend directory

```
MONGODB_URI=<mongodb://username:password@host:port/database>
GOOGLE_CLIENT_ID=<1234567890-abcd1234efgh56789ijklmnopqrstuvwxyz.apps.googleusercontent.com>
GOOGLE_CLIENT_SECRET=<abcdefghijklmnopqrstuvwxyz0123456789>
SESSION_SECRET=<mysecretkey>
ADMIN_EMAIL=<admin@example.com>
```

Sample .env file in frontend directory

```
REACT_APP_BACKEND_URL=<your_backend_url>
```

Sample Google API credentials

```
{
  "type": "service_account",
  "project_id": <project_id>,
  "private_key_id":<private_key_id>,
  "private_key": <private_key>,
  "client_email": <email@example.com>,
  "client_id": <client_id>,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "",
  "universe_domain": "googleapis.com"
}
```

8. The deployed web application can also be accessed at [https://cas-clearance.vercel.app/](https://cas-clearance.vercel.app/)
