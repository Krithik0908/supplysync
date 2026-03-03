```markdown
# SupplySync - AI-Powered Email Assistant for Small Suppliers


SupplySync helps small suppliers manage emails from large companies instantly. Paste any supplier email and get AI-powered analysis, payment delay detection, risk assessment, and auto-generated responses.

## ✨ Features

- **🤖 AI Email Analysis** - Instant analysis using Groq API (Llama 3.3 70B)
- **💰 Payment Delay Detection** - Automatically identifies delayed payments
- **⚠️ Risk Assessment** - Scores emails as Low, Medium, or High risk
- **📝 Auto-Generated Responses** - Creates professional follow-up emails instantly
- **📊 Interactive Dashboard** - Track all analyzed emails with stats and insights
- **📚 Email History** - Never lose track of important communications
- **📄 PDF Generator** - Create professional payment reminder documents
- **🎨 Beautiful UI** - Modern, responsive design with 21st.dev components

## 🚀 Live Demo

 (https://supplysync-five.vercel.app/)

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, 21st.dev components
- **UI Library:** shadcn/ui, Framer Motion, Lucide Icons
- **AI:** Groq API with Llama 3.3 70B
- **Database:** MongoDB Atlas
- **PDF Generation:** React PDF
- **Deployment:** Vercel
- **Animations:** Anime.js



## 🏗️ Installation

1. Clone the repository:
```bash
git clone https://github.com/Krithik0908/supplysync.git
cd supplysync
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=your_mongodb_connection_string_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ MongoDB Setup

1. Create a free [MongoDB Atlas](https://www.mongodb.com/atlas) account
2. Create a new cluster
3. Get your connection string
4. Add it to `.env.local` as `MONGODB_URI`

## 🤖 Groq API Setup

1. Sign up for [Groq](https://console.groq.com)
2. Get your API key
3. Add it to `.env.local` as `GROQ_API_KEY`

## 📁 Project Structure

```
supplysync/
├── app/
│   ├── api/
│   │   ├── analyze/     # Groq API integration
│   │   ├── history/      # MongoDB data fetching
│   │   └── generate-pdf/ # PDF generation
│   ├── dashboard/        # Dashboard page
│   ├── history/          # History page
│   ├── analysis/         # Analysis page
│   ├── response/         # Response page
│   └── page.tsx         # Home page
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── FloatingParticles.tsx
│   └── aurora-borealis-shader.tsx
├── lib/
│   └── mongodb.ts       # MongoDB connection
└── public/              # Static assets
```

## 🎯 Key Features Explained

### Email Analysis
- Paste any supplier email
- AI extracts purpose, payment status, risk level
- Get suggested actions instantly

### Dashboard
- Real-time stats overview
- Filter by risk level
- Quick access to recent analyses

### History
- View all past analyses
- Search and filter capabilities
- One-click access to responses

### PDF Generation
- Create professional payment reminders
- Include analysis summary
- Download and print ready

## 🚀 Deployment

This project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Connect your repository to [Vercel]([https://vercel.com](https://supplysync-five.vercel.app/))
3. Add environment variables
4. Deploy automatically

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📝 License

MIT License - feel free to use this project for your own purposes.


## 📧 Contact

Krithik 

Project Link: (https://github.com/Krithik0908/supplysync)
```

## Instructions:

1. Replace placeholder text:
   - `your-vercel-url.vercel.app` with your actual Vercel URL
   - Add actual screenshot links (upload images to your repo and use their paths)
   - Update Twitter handle if you want
   - Add any additional features you've implemented

2. To add screenshots:
   - Take screenshots of your app
   - Save them in a `/public/screenshots/` folder
   - Use paths like `/screenshots/home.png`

3. Commit and push:
```bash
git add README.md
git commit -m "Add comprehensive README"
git push
```

