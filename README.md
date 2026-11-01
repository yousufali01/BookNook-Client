# 📚 BookNook — Your Reading Corner

A modern and user-friendly online library management platform where readers can discover books, manage their personal collections, and keep track of borrowed books.

BookNook makes book discovery and library management simple, organized, and enjoyable.

---

## 🌐 Project Overview

**BookNook** is a full-stack library management application built with Next.js and MongoDB. It provides an intuitive interface for exploring books, viewing book details, adding books, and managing personal reading and borrowing activities.

Whether you want to discover your next favorite book or organize your library, BookNook brings everything together in one place.

## ✨ Key Features

- 📖 **Explore Books:** Browse the available book collection.
- 🔍 **Book Details:** View individual book information and availability.
- ➕ **Add Books:** Add new books to the library.
- 🔐 **Authentication:** Register and sign in securely.
- 📚 **My Books:** Manage your personal book collection.
- 🔄 **Borrow Management:** Keep track of borrowed books.
- 🎠 **Hero Slider:** Explore featured content through an interactive slider.
- 🏷️ **Book Categories:** Discover books by category.
- 🔔 **Toast Notifications:** Get feedback for important actions.
- 📱 **Responsive UI:** Enjoy a clean interface across different screen sizes.

## 🛠️ Technologies Used

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Swiper.js
- Lucide React
- React Icons
- React Hot Toast

### Backend & Database
- Node.js
- Express.js
- MongoDB

### Authentication & Validation
- Better Auth
- React Hook Form
- Zod

### Development Tools
- Git
- GitHub
- ESLint
- VS Code

## 📂 Project Structure

```text
frontend/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── add-book/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...all]/
│   │   ├── books/
│   │   │   └── [id]/
│   │   ├── login/
│   │   ├── my-books/
│   │   ├── my-borrows/
│   │   ├── register/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   └── ui/
│   │
│   └── lib/
│       ├── auth-client.ts
│       ├── auth.ts
│       ├── mongodb.ts
│       └── utils.ts
│
├── .env
├── package.json
└── next.config.ts
```

## ⚙️ Getting Started

Follow these instructions to run the project locally.

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Navigate to the Frontend Directory

```bash
cd BookNook-Client/frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the frontend root directory.

Configure the API URL and authentication/database environment variables according to your backend and `src/lib/auth.ts` configuration.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000

MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

**Important:** Never share your real database credentials or authentication secrets publicly.

### 5. Run the Development Server

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Creates an optimized production build |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint |

## 🔗 Application Routes

| Route | Description |
|---|---|
| `/` | Home page |
| `/books` | Browse all books |
| `/books/[id]` | View book details |
| `/add-book` | Add a new book |
| `/login` | User login |
| `/register` | User registration |
| `/my-books` | Manage personal books |
| `/my-borrows` | Manage borrowed books |

## 🎨 UI Highlights

- Clean and modern interface
- Emerald and slate color palette
- Interactive book cards
- Responsive navigation
- Attractive hero slider
- Organized content sections

## 🚀 Future Improvements

- Advanced book search and filtering
- Pagination for large book collections
- User profile management
- Book reviews and ratings
- Improved borrowing history
- Admin dashboard and analytics

## 👨‍💻 Developer

**Developed with ❤️ as a Full Stack Web Development Project.**

---

⭐ If you like this project, consider giving it a star on GitHub!

**BookNook — Discover. Read. Organize.**