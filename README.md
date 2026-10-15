ABHI — Personal AI Assistant

A personal AI assistant built with Python, Django, Ollama, and MySQL. ABHI provides a web-based chat interface for interacting with a locally running language model, with voice input and speech output features.

Features

- AI-powered conversations using the local Ollama model "llama3.2:3b"
- Web-based chat interface built with HTML, CSS, and JavaScript
- Python backend powered by Django
- MySQL integration for storing assistant data and memory
- Voice input and speech output support
- Environment-variable-based configuration for sensitive settings

Technologies Used

- Language: Python
- Web framework: Django
- AI model runtime: Ollama
- Language model: Llama 3.2 (3B)
- Database: MySQL
- Frontend: HTML, CSS, JavaScript
- Voice: SpeechRecognition and pyttsx3

Project Structure

Personal_AI-Assistant/
├── main.py
├── requirements.txt
├── README.md
├── .gitignore
└── web/
    ├── manage.py
    ├── assistant/
    ├── chat/
    │   ├── templates/
    │   └── static/
    └── web/
        └── settings.py

Prerequisites

- Python 3.10
- Ollama installed locally
- The Ollama model "llama3.2:3b"
- MySQL Server
- Git

Setup

1. Clone or download this repository.

2. Install the required Python packages:
   
   pip install -r requirements.txt

3. Install and start Ollama, then download the model:
   
   ollama pull llama3.2:3b

4. Create a private ".env" file in the project root with your own database settings and Django secret key. Use ".env.example" as a template if one is provided. Never upload your actual ".env" file.

5. Create and configure the MySQL database required by the application.

6. Start the Django server:
   
   cd web
python manage.py check
python manage.py runserver

7. Open "http://127.0.0.1:8000/" in your browser.

Security Notes

- Never commit passwords, API keys, secret keys, or private environment files.
- Keep local database files and backups out of version control.
- The Django development server is intended for local development, not production deployment.
- Voice recognition and some speech features may depend on your operating system, browser, microphone permissions, and network availability.

Author

Mallekedi Abhignya
B.Tech — Electronics and Communication Engineering

Project Status

Developed as a personal learning project exploring local AI, Python, web development, database integration, and voice interaction.
