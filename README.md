#EasyCook Web Aplication

Is a full-stack web application built with Node.js, Express and MongoDB that allows users to select meal kits, register accounts and interact with a role-based system for customers and data clerks.

#Features
  - Browse meals by category
  - User authentication
  - Password hashing
  - Role management
  - Restricted acces to routes
  - Email confirmation
  - Error handling
  - Shooping cart
  - Meal management

#Tools
  - Node.js
  - Express.js
  - MongoDB
  - EJS
  - TailwindCSS/DaisyUI
  - Express Session
  - bcrypt.js
  - Mailgun

#How it works
  - Express server configures with EJS layouts
  - Handle routes using controllers
  - Session middleware handles user and role for view rendering
  - MongoDB stores user data using Moongose
#Authentication
  - Password are hashed using bcrypt
  - Login validation using bcrypt comparison
  - Sessions are used to handle login state
#Form Validation
  - Server-side validation:
    - Email (regex)
    - Password
  - Custome error page
#Email integration
  - Welcome email after registration
  - Enviroment variables to sotre API keys

#How to run
  1. npm install
  2. Configure enviroment variables
       - DB_KEY=your_mongodb_connection_string
       - SESSION_SECRET=your_secret
       - MAILGUN_API_KEY=your_api_key
       - DB_KEY=your_mongodb_connection_string
  3. node server.js
  4. Open http://localhost:8080

Or visit:
  https://web-project-easy-cook.vercel.app/

#Future Improvements
  - Improve UI/UX and responsiveness

#Author
Juan Diego Correa Noy
