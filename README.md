# LaudAI-Frontend

## Como subir a aplicação

1. Baixe o docker engine [link](https://docs.docker.com/engine/install/ubuntu/)
2. Vá para a pasta do app **laudAI-app**:
```bash
cd ./laudAI-app
```
3. Rode o comando:

```bash
docker compose up --build
```
4. Agora acesse o endereço que o **VITE** disponibiliza no navegador
5. Pronto o seu App está pronto para uso

**Obs: Comandos que podem ser úteis com docker** 

```bash
docker compose up -d # não mostra os logs no terminal e permite o uso do mesmo.
docker logs laudai-app-react-1 # mostra os logs do app.
docker compose down # destruir o container.
docker compose down -v # destruir o container e remover o volume de dados salvos/
```

## Estrutura do Projeto

```
src/
├── components/
│   ├── chat/              # Componentes relacionados ao chat
│   │   ├── Bubble.tsx          # Bolha de mensagem (usuário / assistente)
│   │   ├── ChatView.tsx        # Interface do chat (header, mensagens, input)
│   │   └── FeedbackContent.tsx # Renderização de nota e critérios do laudo
│   ├── layout/            # Componentes de layout
│   │   └── Sidebar.tsx         # Sidebar com logo, lista de conversas e footer do usuário
│   ├── onboarding/        # Tela inicial de upload / colagem de laudo
│   │   └── Onboarding.tsx
│   └── ui/                # Componentes atômicos reutilizáveis
│       ├── Icons.tsx           # Componente SVG Ico + objeto ICONS com paths
│       └── Typing.tsx          # Indicador de digitação com animação
├── contexts/
│   └── AuthContext.tsx         # Contexto de autenticação Firebase (AuthProvider + useAuth)
├── pages/
│   ├── LoginPage.tsx           # Tela de login com Google
│   └── MainApp.tsx             # Componente principal pós-login (orquestrador)
├── routes/
│   └── model_routes.ts         # Chamadas à API de análise e formatação de resposta
├── services/
│   └── api.ts                  # Wrapper fetch com injeção de token JWT
├── theme/
│   └── theme.ts                # Função theme() e tipo Theme (claro/escuro)
├── utils/
│   └── helpers.ts              # Funções utilitárias (genId, formatDate, titleFromText)
├── App.tsx                     # Componente raiz (AuthProvider, tema claro/escuro, rota login/main)
├── main.tsx                    # Ponto de entrada do React
├── index.css                   # Estilos globais
├── vite-env.d.ts               # Tipos de ambiente do Vite
├── types.ts                    # Interfaces compartilhadas (Conversation, Message)
└── firebase.ts                 # Configuração e instância do Firebase
```
## Integrar com o Backend 

1. Clonar o Repositório no mesmo local do repositório do Frontend

```bash
git clone https://github.com/Pibic-Pibiti-Huac/LaudAI-Backend.git
```

2. Criar a **rede** entre os dois containers 

```bash
docker network create app-network
```