# IntelliChat — Groq Only

A Flask chatbot with **Groq as the sole AI provider**, chat history, model selection, Google sign-in (optional), and the original **Improve Prompt** workflow.

## Setup — Windows CMD

1. Get a Groq API key from https://console.groq.com/keys and paste it as the only line in `groq_api_key.txt` (or set the `GROQ_API_KEY` environment variable). **Do not commit or share the key.**
2. Open CMD in the `intellichat` folder and run:

```cmd
py -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
python app.py
```

Visit http://localhost:5000 . If a venv already exists, skip the create step.

## Features

- **Chat:** Groq Llama models available to your account. Model list is checked against Groq's API; unavailable models are not shown.
- **Improve Prompt:** Click ✦ Improve Prompt to turn rough instructions into an editable structured prompt. You can keep the original, regenerate, or send the improved version. This uses the same Groq key.
- **Optional web research:** Wikipedia search without any additional API key. Turn off the research toggle for faster answers.
- **Sign-in:** Username/password works without Google credentials. To enable optional Google sign-in, add a Google OAuth client ID to `google_client_id.txt` and configure the `http://localhost:5000` origin.

Groq quota and rate limits still apply. The app cannot bypass provider restrictions. Python syntax is checked, but live API calls require your own valid key.
