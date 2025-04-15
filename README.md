# Logos AI

**Logos AI** is a robust and modular Node.js application built with Express and Prisma ORM. It is an efficient chatbot framework integrated with WhatsApp via the Evolution API, designed for automating customer service, virtual assistants, and other AI-driven solutions.

Perfect for creating simple support agents or advanced chatbots based on customizable prompt systems.

---

## Features

- **User Management:** Automatically creates a profile for each WhatsApp contact, storing user data in the database.
- **Chat System with History:** Maintains a full conversation history in the backend, enabling contextual and personalized responses.
- **RESTful API:** Built with Express, it provides a robust API for integrations, used as a webhook in Evolution.
- **Advanced Security:** Uses `bcryptjs` for password hashing and `jsonwebtoken` for authentication, ensuring data protection.
- **Modularity:** Organized modular structure allows scalability and easy addition of new features.
- **Customizable PromptSystem:** Configure chatbot behavior by editing Markdown prompts, tailoring it to various use cases.

---

## Getting Started

### Prerequisites

- **Node.js**: Version >= 18
- **Evolution API**: Version > 2.0

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/johanlabs/logos-ai
   cd logos-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Evolution API Setup

Logos AI relies on the [Evolution API](https://github.com/EvolutionAPI/evolution-api) for WhatsApp integration. Set up your own instance or obtain credentials from an existing API.

### Environment Configuration

Create a `.env` file in the project root with the following variables:

| Variable                    | Description                                                               |
|-----------------------------|---------------------------------------------------------------------------|
| `DATABASE_URL`              | Database connection URL (default: SQLite; optional: PostgreSQL, etc.)     |
| `DOMAIN`                    | Domain where the application will be hosted                               |
| `AI_SERVER_API_KEY`         | API key for the AI inference server                                       |
| `AI_SERVER_API_URL`         | URL of the AI API (OpenAI-compatible)                                     |
| `INFERENCE_DEFAULT`         | Default AI model to be used                                               |
| `EVOLUTION_API_KEY`         | Evolution API key                                                         |
| `EVOLUTION_API_URL`         | Evolution API URL                                                         |
| `EVOLUTION_WAIT_TIME`       | Wait time (ms) for processing sequential messages                         |
| `EVOLUTION_INSTANCE`        | Name of the Evolution instance                                            |
| `EVOLUTION_INSTANCE_APIKEY` | Instance API key for webhook security                                     |

**Tip:** Beginners should keep the default `DATABASE_URL` (SQLite). Advanced users can configure databases like PostgreSQL for better performance.

### PromptSystem Configuration

Customize the chatbot’s behavior by editing the Markdown prompt file located at:

```
/prompts/default.md
```

This file defines the instructions guiding the chatbot’s responses, allowing customization for scenarios like customer support, technical assistance, or casual interactions.

### Running the Application

- **Development Mode (with Hot-Reload):**
  ```bash
  npm run dev
  ```

- **Production Mode:**
  ```bash
  npm start
  ```

**Recommendation:** For production deployment, use tools like `pm2` or `EasyPanel` for stability and management.

---

## Project Structure

```
├── prisma/                   # Prisma configurations and migrations
│   ├── generated/          # Generated Prisma client
│   └── schema.prisma       # Database schema
├── prompts/                 # PromptSystem configuration files
│   └── default.md          # Default chatbot prompt
├── script/                   # Auxiliary scripts
│   ├── composer.js         # Composition script
│   └── prisma/             # Prisma scripts
│       └── createSchema.js # Schema creation script
├── src/                      # Main source code
│   ├── core/               # Core functionalities (@core)
│   ├── packages/           # Functional modules (@packages)
│   ├── utils/              # Utilities and helpers (@utils)
│   ├── app.js              # Entry point
│   └── server.js           # Server configuration
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── README.md               # Documentation
```

---

## Why Choose Logos AI?

- **Ease of Use:** Quickly set up chatbots with seamless WhatsApp integration.
- **Customization:** Tailor prompts and modules to meet specific requirements.
- **Scalability:** Grow effortlessly with a modular and robust architecture.
- **Security:** Protect user data with top-tier authentication and encryption.

---

## Contributions and Support

- **License:** [MIT](LICENSE)
- **Contributions:** Want to contribute? Check out the [contribution guide](CONTRIBUTING.md).
- **Support:** For questions or issues, open an issue on the [repository](https://github.com/johanlabs/logos-ai).
