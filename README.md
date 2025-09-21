# Driving License Theory Questions Server

This is the backend server for the driving license theory questions application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Questions
- `GET /questions` - Get all questions with optional filtering
- `GET /questions/random` - Get random questions
- `GET /questions/:id` - Get question by ID
- `GET /questions/download/pdf` - Download questions as PDF

### Subjects and Topics
- `GET /subjects` - Get all subjects
- `GET /topics` - Get all topics
- `GET /subjects/sub` - Get sub-subjects
- `GET /topics/counts` - Get question counts per topic

### User Progress
- `GET /progress/:userId` - Get user progress
- `POST /progress/update` - Update user progress
- `GET /progress/:userId/wrong` - Get wrong questions for user
- `GET /progress/:userId/completed` - Get completed questions for user
- `GET /progress/:userId/remaining` - Get remaining questions for user

### Answers
- `POST /answers` - Save user answer and update progress

## Features

- ✅ Question filtering by subject, sub-subject, and license type
- ✅ User progress tracking
- ✅ Wrong questions filtering by category
- ✅ PDF generation for questions
- ✅ Support for Hebrew and Arabic languages
- ✅ CORS enabled for frontend integration

## File Structure

```
chat-gpt-server/
├── controllers/
│   ├── questionsController.js    # Question-related endpoints
│   └── userProgressController.js # User progress tracking
├── models/
│   └── questionsModel.js         # Question data model
└── data/
    └── progress/                 # User progress files (auto-created)
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `REACT_APP_API_URL` - API URL for frontend (default: http://localhost:3000)
