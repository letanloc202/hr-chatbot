# HR Chatbot Demo

A demo HR chatbot built with Next.js, TailwindCSS, and LangChain, integrated with OpenRouter for LLM access.

## Features

- **Chat UI** with model selection (GPT-4o Mini, Llama 3.3 70B, GPT-OSS 20B)
- **Employee Info Panel** with mock data and randomization
- **Company Policy Panel** with static policy information
- **Leave Request Processing** - automatically detects and processes time-off requests
- **Toast Notifications** for successful operations
- **Chat Reset** functionality
- **Responsive Design** with TailwindCSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **AI**: LangChain with OpenRouter integration
- **Data Storage**: JSON files (no database required)
- **Validation**: Zod schemas

## Setup

1. **Clone and install dependencies:**
   ```bash
   cd hr-chatbot
   npm install
   ```

2. **Environment Configuration:**
   Create `.env.local` file:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   ```

3. **Get OpenRouter API Key:**
   - Sign up at [OpenRouter](https://openrouter.ai/)
   - Generate an API key
   - Add it to your `.env.local` file

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
hr-chatbot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/           # Chat endpoints
│   │   │   ├── leave/          # Leave request processing
│   │   │   ├── policy/         # Policy management
│   │   │   └── demo/           # Demo data endpoints
│   │   ├── components/         # React components
│   │   └── lib/               # Utility functions
│   └── data/                  # JSON data files
├── .env.local                 # Environment variables
└── README.md
```

## API Endpoints

### Chat
- `POST /api/chat` - Process chat messages
- `GET /api/chat/messages` - Fetch chat history
- `POST /api/chat/reset` - Reset chat

### Leave Management
- `POST /api/leave/parse` - Parse leave requests using LLM
- `POST /api/leave/create` - Create leave cases

### Policy
- `POST /api/policy/reembed` - Update policy index

### Demo
- `GET /api/demo/employee` - Fetch employee data
- `POST /api/demo/seed` - Randomize employee data

## Usage Examples

### Asking for Time Off
Type: "I want to take next Monday off"

The chatbot will:
1. Detect this as a leave request
2. Parse the dates using the LLM
3. Create a leave case
4. Show a success toast
5. Provide a helpful response

### General HR Questions
Ask about:
- Company policies
- Leave entitlements
- Work arrangements
- Benefits and procedures

## Data Files

- `data/employee.json` - Employee information
- `data/leave_cases.json` - Leave request history
- `data/messages.json` - Chat conversation history
- `data/policy.txt` - Company policy text
- `data/policy.index.json` - Policy index structure

## Customization

### Adding New Models
Edit `src/components/ModelSelect.tsx` to add more OpenRouter models.

### Modifying Policies
Update `data/policy.txt` with your company's actual policies.

### Changing System Prompts
Modify prompts in `src/lib/langchain.ts` to adjust the chatbot's behavior.

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your OpenRouter API key is correct in `.env.local`
2. **Model Not Available**: Some models may be temporarily unavailable on OpenRouter
3. **Rate Limits**: OpenRouter has rate limits; check their documentation

### Debug Mode
Check browser console and terminal for detailed error logs.

## Contributing

This is a demo project. Feel free to fork and modify for your own use.

## License

MIT License - feel free to use this project for learning and development.
