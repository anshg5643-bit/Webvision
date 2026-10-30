## Webvision
# 🤖 IntelliChat AI
### An Intelligent AI Chatbot with Two-Step Prompt Enhancement

## 🎯 Problem Statement

Most AI chatbots generate responses directly from user prompts, even when the instructions are incomplete or unclear. This often leads to inaccurate, irrelevant, or unsatisfactory results.

Users also face challenges such as writing effective prompts, accessing updated information, and managing previous conversations.

## 💡 Our Solution

**IntelliChat AI** is a full-stack AI assistant powered by Groq that improves response quality through an intelligent **Two-Step Prompt Verification System**.

**Step 1 — Prompt Analysis:** AI analyzes the user's request and asks relevant questions to understand their exact requirements.

**Step 2 — Prompt Enhancement:** AI converts the collected information into a detailed, structured prompt. After user approval, it generates the final response.

This approach aims to reduce ambiguity and deliver more relevant results.

## ✨ Key Features

- 🧠 **AI Prompt Enhancement** — Automatically improves incomplete prompts.
- 🔍 **Two-Step Verification** — Asks clarification questions before generating complex responses.
- ⚡ **Groq AI Integration** — Fast AI-powered responses with automatic model fallback.
- 🌐 **Web Research** — Retrieves information and provides source references.
- 🔐 **Secure Authentication** — Google Sign-In and username/password login.
- 💾 **Chat History** — Stores user conversations using SQLite.
- 🎨 **Modern UI** — Responsive, ChatGPT-inspired interface.

## 🛠️ Tech Stack

| Frontend | Backend | AI | Database |
|---|---|---|---|
| HTML, CSS, JavaScript | Python, Flask | Groq API | SQLite |

**Additional Integrations:** Google OAuth, Wikipedia API, Tavily API.

## ⚙️ Installation

**1. Clone the repository**
```bash
git clone <repository-url>
cd intellichat
```

**2. Install dependencies**
```bash
pip install -r requirements.txt
```

**3. Configure API credentials**

Add your credentials to:
- `groq_api_key.txt`
- `google_client_id.txt`
- `tavily_api_key.txt` (optional)

Keep these credential files out of public repositories.

**4. Run the application**
```bash
python app.py
```

Open `http://localhost:5000` in your browser.

## 🚀 Future Scope

- Automatic PPT and document generation
- AI-powered website builder
- Voice-based AI interaction
- Advanced fact verification
- File upload and analysis

## 🏆 Our USP

**"Don't Just Write a Prompt. Let AI Help You Build the Right Prompt."**

Unlike traditional chatbots, IntelliChat focuses on understanding and refining user requirements before generating complex responses.

---

**IntelliChat AI — Think Better. Prompt Smarter. Create Faster.**
