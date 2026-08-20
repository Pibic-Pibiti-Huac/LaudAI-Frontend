# LaudAI-Frontend

## How to run the application

1. Download Docker Engine [link](https://docs.docker.com/engine/install/ubuntu/)
2. Go to the **laudAI-app** folder:
```bash
cd ./laudAI-app
```
3. Run the command:

```bash
docker compose up --build
```
4. Now access the address provided by **VITE** in the browser
5. Done, your App is ready to use

**Note: Docker commands that may be useful**

```bash
docker compose up -d # doesn't show logs in the terminal and frees it up for use.
docker logs laudai-app-react-1 # shows the app logs.
docker compose down # tear down the container.
docker compose down -v # tear down the container and remove the saved data volume.
```

## Project Structure

```
src/
├── components/
│ ├── chat/ # Chat-related components
│ │ ├── Bubble.tsx # Message bubble (user / assistant)
│ │ ├── ChatView.tsx # Chat interface (header, messages, input)
│ │ └── FeedbackContent.tsx # Rendering of report score and criteria
│ ├── layout/ # Layout components
│ │ └── Sidebar.tsx # Sidebar with logo, conversation list, and user footer
│ ├── onboarding/ # Initial screen for uploading / pasting a report
│ │ └── Onboarding.tsx
│ └── ui/ # Reusable atomic components
│ ├── Icons.tsx # SVG Icon component + ICONS object with paths
│ └── Typing.tsx # Typing indicator with animation
├── contexts/
│ └── AuthContext.tsx # Firebase authentication context (AuthProvider + useAuth)
├── pages/
│ ├── LoginPage.tsx # Login screen with Google
│ └── MainApp.tsx # Main post-login component (orchestrator)
├── routes/
│ └── model_routes.ts # Calls to the analysis API and response formatting
├── services/
│ └── api.ts # Fetch wrapper with JWT token injection
├── theme/
│ └── theme.ts # theme() function and Theme type (light/dark)
├── utils/
│ └── helpers.ts # Utility functions (genId, formatDate, titleFromText)
├── App.tsx # Root component (AuthProvider, light/dark theme, login/main route)
├── main.tsx # React entry point
├── index.css # Global styles
├── vite-env.d.ts # Vite environment types
├── types.ts # Shared interfaces (Conversation, Message)
└── firebase.ts # Firebase configuration and instance
```

## Integrating with the Backend

1. Clone the repository in the same location as the Frontend repository

```bash
git clone https://github.com/Pibic-Pibiti-Huac/LaudAI-Backend.git
```

2. Create the **network** between the two containers

```bash
docker network create app-network
```

3. Run both coontainers

```bash
docker compose up --build -d
```