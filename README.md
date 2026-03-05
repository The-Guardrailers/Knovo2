# KNOVO = Knowledge + Voice - AI-powered Voice Based Quiz Platform

![Knovo Logo](./public/demo.png)

# Built for the AMD Hackathon

🌐 **Live Deployment** → [Knovo App](https://knovo-dhlb.vercel.app)

## 🌟 Overview

Knovo transforms traditional quizzing into an **immersive, voice-driven learning experience**.  
Instead of static question banks, it dynamically generates quizzes from **form input (titles, PDFs)** , or **voice input (Vapi Workflow)** using **Gemini AI**. Learners attempt quizzes in **voice** mode with a **Vapi Agent (A Quizmaster)** , get **real-time feedback**, and compete with others via **leaderboards**.

### Mission / Purpose

Make learning **inclusive, engaging, and personalized** — for **students, educators,** and especially the **visually impaired** who benefit from a screen-free, hands-free quiz experience.

---

## ⚙️ How to Set Up and Run the Project

### 1. Clone the repository

```bash
git clone https://github.com/The-Guardrailers/Knovo2.git
cd Knovo2
```

### 2. Install all the dependencies

This command will download all the required dependencies , to still know about the most important ones, refer to the _requirements.txt_ file in the root folder.

```bash
npm install
```

### 3. Configure Environment Variables

In the root folder , create **.envlocal** file and add the following:-

```env
FIREBASE_PROJECT_ID="Your Key"
FIREBASE_PRIVATE_KEY="Your Key"
FIREBASE_CLIENT_EMAIL="Your Key"
GOOGLE_GENERATIVE_AI_API_KEY="Your Key"
NEXT_PUBLIC_VAPI_WEB_TOKEN="Your Key"
NEXT_PUBLIC_VAPI_WORKFLOW_ID="Your Key"
NEXT_PUBLIC_VAPI_MISCELLANEOUS_ID="Your Key"
NEXT_PUBLIC_DEMO_WORKFLOW_ID="Your Key"
```

### ⚠️ Important Notice (Setup Guide)

- Please replace all environment variable values with **your own API keys** for services such as **Gemini** and **Vapi AI**.
- For **Firebase** and **Vapi workflows** (`NEXT_PUBLIC_VAPI_*`), except the Vapi web token, you will need to use the keys provided by us. This is because the workflows and Firestore database indexes have been created under our account.
- Alternatively, you may use our _Special Setup guide_ mentioned in our _Supplementary File_ or use _live deployment_ to test the application without setting up your own environment:

👉 [Knovo on Vercel](https://knovo-dhlb.vercel.app)

### 4. Run the application

```bash
npm run dev
```

---

## 📂 Submissions

- **Team Name**: The Guardrailers
- **Team Lead**: Shreesh Prateek Pathak
- **Problem Statement**: AI in Education and Skilling Architecture
- **Demo Video** → [Demo Video Drive Link](https://drive.google.com/file/d/1fvZgq9G7V3mbFjCHTgJt6i7QCWBp4pH_/view?usp=sharing)
- **Live App** → [Knovo on Vercel](https://knovo-dhlb.vercel.app)

---
