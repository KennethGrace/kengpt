# KenGPT

[![Version](https://img.shields.io/badge/Main_Release-0.2.1-lightgrey.svg?logo=github&style=flat-square)](https://github.com/knnethgrace/KenGPT/releases)

An Open-Source AI Assistant Platform.

[![GNU GPL License](https://img.shields.io/badge/GNU_General_Purpose_License_v3-maroon.svg?logo=gnu&style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0.en.html)

## Features

- Modern web application built with [React](https://reactjs.org/) and [Material-UI](https://material-ui.com/).
- API service built with [FastAPI](https://fastapi.tiangolo.com/).
- Local AI inference with [Ollama](https://ollama.com/).

This application uses ephemeral browser storage for user chat data. This ensures that your data is kept private, but it also means that your chat history and AI profile settings will be lost when your browser session ends.

## Walkthrough

Hello! Welcome to the KenGPT setup walkthrough. This guide will help you get started with deploying KenGPT on a local machine for a single-user environment using Docker. Perfect for personal use or small teams.

First you will need to install [Docker](https://www.docker.com/). If you want to use a GPU for AI inference, you will need the [NVIDIA Container Toolkit](https://https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) along with installing [Ollama](https://ollama.com/). To install models, you'll use the `ollama pull` command line tool. However, in order to avoid conflicts when deploying with Docker, you will need to shutdown the Ollama service before deploying KenGPT.

> NOTE: When deploying with Docker compose, the Ollama service will expect an available volume at `/usr/share/ollama/.ollama` for storing models. This is also the default location for the `ollama pull` command.

### Deployment

Did you install what we need? Let's check if everything is ready for us.
  
```bash
# Docker and Docker Compose
docker version
docker compose version
# NVIDIA Container Toolkit
nvidia-container-cli --version
```

Ready to get started? Let's deploy KenGPT with Docker Compose.

```bash
# Deploy with Docker Compose
docker compose up --build -d
```

**That's it!** You can continue to the next step, [Hello KenGPT](#hello-kengpt), to access the web app.

### Hello KenGPT

You should now be able to access the web app at <http://localhost:80/> (or whatever host you deployed to). Go ahead and open it in your browser. You should see the KenGPT web app.

#### Configuration

You can make changes to your KenGPT settings by clicking the gear icon in the top left corner of the app. Here you can change and define your own AI profiles including setting custom instructions and the AI model.