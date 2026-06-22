# 🍽️ Sai Ram Restaurant - Full Stack MERN Application

![Live Demo](https://img.shields.io/badge/Live_Demo-Online-success?style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

A complete, production-ready restaurant management system and online ordering platform. Built with the **MERN stack** (MongoDB, Express, React, Node.js) and powered by **Socket.IO** for real-time order tracking.

🌐 **Live Demo:** [https://sairam-73yn.onrender.com](https://sairam-73yn.onrender.com)

---

## ✨ Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and security clearances for `Customers`, `Kitchen Staff`, `Drivers`, and `Boss/Admin`.
- **Real-Time Order Tracking:** Customers see a live-animated progress bar that updates instantly via WebSockets the moment the Kitchen or Driver changes the order status.
- **Smart Delivery Radius:** Integrates with the browser's Geolocation API to automatically calculate delivery distance and enforce a maximum kilometer radius before checkout.
- **Kitchen & Driver Dashboards:** Live, automatically refreshing kanban-style dashboards for staff to accept, cook, and deliver incoming orders.
- **Boss Analytics Dashboard:** Administrative view with revenue metrics, user management, and complete menu control.
- **Secure Authentication:** JWT-based authentication with properly hashed passwords.
- **Modern UI/UX:** Responsive, mobile-first design with smooth Framer Motion animations.

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, React Router, Framer Motion, Lucide Icons
- **Backend:** Node.js, Express.js (v5)
- **Database:** MongoDB Atlas, Mongoose
- **Real-Time Engine:** Socket.IO
- **Security:** Helmet, CORS, Express Rate Limit, bcrypt, JSON Web Tokens (JWT)

---

