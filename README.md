# HR Chatbot Demo

A demo HR chatbot built with Next.js, TailwindCSS, and LangChain, integrated with OpenRouter for LLM access. Features a modern, responsive interface with Vietnamese language support for HR interactions.

## Features

- **Modern Chat Interface** with HR Assistant avatar and reload functionality
- **Multi-Model AI Support** (GPT-4o Mini, Llama 3.3 70B, GPT-OSS 20B)
- **Employee Profile Panel** with avatar, larger name display, and refresh button
- **Dynamic Policy Management** with CRUD operations and color-coded categories
- **Vietnamese Language Support** - policies and responses in Vietnamese
- **Leave Request Processing** - professional approval workflow with supervisor notification
- **Toast Notifications** positioned in top-right corner
- **Responsive Design** with TailwindCSS and modern UI components
- **Semi-transparent Modals** for better user experience

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
│   │   │   ├── chat/           # Chat endpoints with Vietnamese responses
│   │   │   ├── leave/          # Leave request processing
│   │   │   ├── policies/       # Policy CRUD operations
│   │   │   └── demo/           # Demo data endpoints
│   │   ├── components/         # React components with modern UI
│   │   └── lib/               # Utility functions and LangChain setup
│   └── data/                  # JSON data files including Vietnamese policies
├── .env.local                 # Environment variables
└── README.md
```

## API Endpoints

### Chat

- `POST /api/chat` - Process chat messages with Vietnamese responses
- `GET /api/chat/messages` - Fetch chat history
- `POST /api/chat/reset` - Reset chat

### Leave Management

- `POST /api/leave/parse` - Parse leave requests using LLM
- `POST /api/leave/create` - Create leave cases

### Policy Management

- `GET /api/policies` - Fetch all policies
- `POST /api/policies` - Create new policy
- `PUT /api/policies` - Update existing policy
- `DELETE /api/policies` - Delete policy

### Demo

- `GET /api/demo/employee` - Fetch employee data
- `POST /api/demo/seed` - Randomize employee data

## Usage Examples

### Asking for Time Off

Type: "Tôi muốn nghỉ thứ Hai tuần sau" (I want to take next Monday off)

The chatbot will:

1. Detect this as a leave request
2. Respond in Vietnamese: "Cảm ơn bạn đã gửi yêu cầu nghỉ phép. Tôi đã ghi lại thông tin của bạn và gửi để phê duyệt. Bạn sẽ nhận được xác nhận từ người giám sát trong vòng 2-3 ngày làm việc. Vui lòng kiểm tra email để cập nhật."
3. Parse the dates using the LLM
4. Create a leave case in the background
5. Show a success toast notification

### General HR Questions

Ask about:

- Chính sách công ty (Company policies)
- Quyền nghỉ phép (Leave entitlements)
- Làm việc từ xa (Remote work)
- Phúc lợi nhân viên (Employee benefits)
- Quy trình làm việc (Work procedures)

### Policy Management

- Add new policies with color-coded categories
- Edit existing policies
- Delete policies
- View all policies in an organized panel

## Data Files

- `data/employee.json` - Employee information
- `data/leave_cases.json` - Leave request history
- `data/messages.json` - Chat conversation history
- `data/policies.json` - Vietnamese company policies with color coding

## Customization

### Adding New Models

Edit `src/components/ChatWindow.tsx` to add more OpenRouter models in the `AVAILABLE_MODELS` array.

### Modifying Policies

Update `data/policies.json` with your company's actual policies. Each policy includes:

- Title and description in Vietnamese
- Color coding for visual organization
- Unique ID for management

### Changing System Prompts

Modify prompts in `src/lib/langchain.ts` to adjust the chatbot's behavior and language preferences.

### UI Customization

- Employee avatar styling in `src/components/EmployeePanel.tsx`
- Chat interface styling in `src/components/ChatWindow.tsx`
- Policy panel styling in `src/components/PolicyPanel.tsx`

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
