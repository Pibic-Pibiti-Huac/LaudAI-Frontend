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
4. Agora acesse o endereço: http://localhost:5173/ no navegador
5. Pronto o seu App está pronto para uso

**Obs: Comnandos que podem ser úteis com docker** 

```bash
docker compose up -d # não mostra os logs no terminal e permite o uso do mesmo.
docker logs laudai-app-react-1 # mostra os logs do app.
docker compose down # destruir o container.
docker compose down -v # destruir o container e remover o volume de dados salvos/ 
```
