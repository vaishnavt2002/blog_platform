
# CMS - Content Management System

A full-stack web CMS application for publishing and sharing blog content, built with Django and React. It allows users to read blog posts, interact with likes/comments, and provides an admin interface for managing content and users.

---

## Features

- **User Authentication**: Admin and User login system
- **Blog Post Management**: Create, update, delete, and view blog posts
- **Comments**: Add/view comments with admin approval/block system
- **User Interaction**: Like, unlike, and read count for posts
- **Admin Panel**: Manage comments
- **Media Upload**: Upload images and attachments using **Cloudinary**
- **Responsive UI**: Built with Tailwind CSS

---

## Tech Stack

### Backend
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Cloudinary (for media file storage)

### Frontend
- React using Vite

---

##  Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv env
source env/bin/activate  # or env\Scripts\activate on Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Setup
Create a `.env` file in the root directory:
```env
SECRET_KEY=your_secret_key
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

### 7. Start Backend Server
```bash
python manage.py runserver
```

Visit: `http://localhost:8000`

---

## Frontend (React + Vite)

### 1. Navigate to the frontend directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Frontend Development Server
```bash
npm run dev
```

Visit: `http://localhost:5173`

---
