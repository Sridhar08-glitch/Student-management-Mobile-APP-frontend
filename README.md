<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1b5e20,100:66bb6a&height=200&section=header&text=Student%20Management%20App&fontSize=58&fontColor=ffffff&fontAlignY=38&desc=React%20Native%20%7C%20Expo%20Mobile%20Application&descAlignY=58&descSize=20&descColor=e8f5e9" width="100%"/>

<br/>

[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.33-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Axios](https://img.shields.io/badge/Axios-1.13.6-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)

<br/>

[![React Navigation](https://img.shields.io/badge/React_Navigation-v7-6750A4?style=for-the-badge)](https://reactnavigation.org/)
[![AsyncStorage](https://img.shields.io/badge/AsyncStorage-2.2.0-FF6B6B?style=for-the-badge)](https://react-native-async-storage.github.io/async-storage/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Active%20Development-blue?style=for-the-badge)]()

<br/>

<a href="#-quick-start">
  <img src="https://img.shields.io/badge/⚡%20Quick%20Start-Setup%20Guide-1b5e20?style=for-the-badge" alt="Quick Start"/>
</a>
&nbsp;
<a href="#-navigation-structure">
  <img src="https://img.shields.io/badge/🗺️%20Navigation-Architecture-00897b?style=for-the-badge" alt="Navigation"/>
</a>
&nbsp;
<a href="#-api-integration">
  <img src="https://img.shields.io/badge/🔌%20API%20Layer-Endpoints-7b1fa2?style=for-the-badge" alt="API"/>
</a>

</div>

---

## 📋 Table of Contents

- [📖 About the Project](#-about-the-project)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🗂️ Project Structure](#️-project-structure)
- [📱 Screens](#-screens)
- [🗺️ Navigation Structure](#️-navigation-structure)
- [🧠 State Management](#-state-management)
- [🔌 API Integration](#-api-integration)
- [⚡ Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [🚀 Running the App](#-running-the-app)
- [🧩 Reusable Components](#-reusable-components)

---

## 📖 About the Project

<div align="center">
  <img src="https://img.shields.io/badge/Type-Mobile%20Application-1b5e20?style=flat-square" />
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-2e7d32?style=flat-square" />
  <img src="https://img.shields.io/badge/Roles-Teacher%20%7C%20Student-388e3c?style=flat-square" />
</div>

<br/>

**Student Management App** is a cross-platform mobile application built with **React Native** and **Expo**. It serves as the frontend for a Django REST Framework backend, providing teachers and students with a clean mobile interface for managing daily school operations — attendance, marks, subjects, and notifications.

> 💡 **Role-based UI** — the app renders a completely different navigator and screen set depending on whether the logged-in user is a `teacher` or `student`.

### What makes it work?

| Challenge | Solution |
|---|---|
| 🔐 Persisting login across app restarts | JWT stored in `AsyncStorage`, restored on mount |
| 🎭 Different UIs for different roles | `AppNavigator` routes to `TeacherNavigator` or `StudentNavigator` |
| 🌐 Attaching auth to every request | Axios request interceptor auto-injects Bearer token |
| 📅 Cross-platform date picking | `DatePickerWrapper` wraps `@react-native-community/datetimepicker` |

---

## ✨ Features

<table>
<tr>
<td>

### 👨‍🏫 Teacher
- Dashboard with student overview
- Add new students with full profile
- Mark daily attendance (present / absent)
- Enter exam marks per subject
- Create and manage subjects
- Send notifications to all or specific students

</td>
<td>

### 🧑‍🎓 Student
- Personal profile & enrollment info
- Full attendance history
- Marks per subject with percentage
- Receive notifications from teachers

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<table>
<tr>
<th align="center">📱 Core</th>
<th align="center">🧭 Navigation</th>
<th align="center">🌐 Data & Storage</th>
</tr>
<tr>
<td>

- **React Native 0.81.5**
- **Expo ~54.0.33**
- **React 19.1.0**
- **Expo Vector Icons ^15.0.3**
- **React Native Reanimated ~4.1.1**
- **React Native Gesture Handler ~2.28.0**

</td>
<td>

- **@react-navigation/native v7**
- **@react-navigation/stack**
- **@react-navigation/bottom-tabs**
- Stack + Bottom Tab combined navigators

</td>
<td>

- **Axios ^1.13.6** — HTTP client
- **AsyncStorage 2.2.0** — token persistence
- **React Context API** — global auth state
- **DateTimePicker 8.4.4** — date inputs

</td>
</tr>
</table>

---

## 🗂️ Project Structure

```
Student-management-Mobile-APP-frontend/
│
├── 📄 App.js                          # Root — SafeAreaProvider → AuthProvider → Navigation
├── 📄 app.json                        # Expo configuration
├── 📄 package.json
│
├── 📁 assets/                         # Icons and splash screen
│   ├── icon.png
│   ├── splash.png
│   └── adoptive-icon.png
│
└── 📁 src/
    ├── 📁 api/
    │   └── api.js                     # Axios instance + all API functions
    │
    ├── 📁 components/                 # Reusable UI components
    │   ├── Button.js
    │   ├── Card.js
    │   ├── DatePickerWrapper.js
    │   ├── Header.js
    │   ├── Input.js
    │   ├── NotificationItem.js
    │   └── StudentItem.js
    │
    ├── 📁 context/
    │   ├── AuthContext.js             # Auth state, login, register, logout
    │   └── AppContext.js              # App-wide shared state
    │
    ├── 📁 navigation/
    │   ├── AppNavigator.js            # Root — routes by auth status & role
    │   ├── AuthNavigator.js           # Login → Register → RoleSelection
    │   ├── TeacherNavigator.js        # Teacher Bottom Tabs + Stack
    │   └── StudentNavigator.js        # Student Bottom Tabs + Stack
    │
    ├── 📁 screens/
    │   ├── LoginScreen.js
    │   ├── RegisterScreen.js
    │   ├── RoleSelectionScreen.js
    │   ├── 📁 teacher/
    │   │   ├── TeacherHomeScreen.js
    │   │   ├── AddStudentScreen.js
    │   │   ├── AttendanceScreen.js
    │   │   ├── MarksScreen.js
    │   │   ├── SubjectsScreen.js
    │   │   └── NotificationScreen.js
    │   └── 📁 student/
    │       ├── StudentHomeScreen.js
    │       ├── StudentAttendanceScreen.js
    │       ├── StudentMarksScreen.js
    │       └── StudentNotificationsScreen.js
    │
    └── 📁 utils/
        ├── colors.js                  # Centralized color palette
        └── styles.js                  # Shared style definitions
```

---

## 📱 Screens

### 🔐 Auth Screens

| Screen | Description |
|---|---|
| `LoginScreen` | Username & password login form |
| `RegisterScreen` | New user registration form |
| `RoleSelectionScreen` | Select Teacher or Student role |

---

### 👨‍🏫 Teacher Screens

| Screen | Tab | Description |
|---|---|---|
| `TeacherHomeScreen` | 🏠 Home | Student overview dashboard |
| `AddStudentScreen` | ➕ Add | Create a new student account |
| `AttendanceScreen` | 📝 Attendance | Mark present / absent for a date |
| `MarksScreen` | 📊 Marks | Enter exam scores by subject |
| `SubjectsScreen` | 📚 Subjects | Add, edit, delete subjects |
| `NotificationScreen` | 🔔 Notifications | Compose and send notifications |

---

### 🧑‍🎓 Student Screens

| Screen | Tab | Description |
|---|---|---|
| `StudentHomeScreen` | 🏠 Home | Personal info and enrollment details |
| `StudentAttendanceScreen` | 📝 Attendance | Personal attendance history |
| `StudentMarksScreen` | 📊 Marks | Marks and percentage by subject |
| `StudentNotificationsScreen` | 🔔 Notifications | Received notifications feed |

---

## 🗺️ Navigation Structure

```
App.js
└── SafeAreaProvider
    └── AuthProvider
        └── NavigationContainer
            └── AppNavigator (Stack)
                │
                ├── [No user / loading] ──► ActivityIndicator spinner
                │
                ├── [user_type = undefined] ──► AuthNavigator (Stack)
                │                               ├── LoginScreen
                │                               ├── RegisterScreen
                │                               └── RoleSelectionScreen
                │
                ├── [user_type = 'teacher'] ──► TeacherNavigator (Stack)
                │                               └── TeacherTabs (Bottom Tabs)
                │                                   ├── TeacherHomeScreen   🏠
                │                                   ├── AddStudentScreen    ➕
                │                                   ├── AttendanceScreen    📝
                │                                   ├── MarksScreen         📊
                │                                   ├── SubjectsScreen      📚
                │                                   └── NotificationScreen  🔔
                │
                └── [user_type = 'student'] ──► StudentNavigator (Stack)
                                                └── StudentTabs (Bottom Tabs)
                                                    ├── StudentHomeScreen          🏠
                                                    ├── StudentAttendanceScreen    📝
                                                    ├── StudentMarksScreen         📊
                                                    └── StudentNotificationsScreen 🔔
```

---

## 🧠 State Management

The app uses React's **Context API** — no Redux or Zustand required.

### AuthContext (`src/context/AuthContext.js`)

The core of all authentication state. Every screen accesses it via the `useAuth()` hook.

| Value / Method | Type | Description |
|---|---|---|
| `user` | Object | Authenticated user (`id`, `username`, `email`, etc.) |
| `profile` | Object | User profile including `user_type` |
| `isLoading` | Boolean | `true` while restoring persisted session |
| `error` | String | Last authentication error message |
| `login(username, password)` | async Function | Calls API, stores token + user in AsyncStorage |
| `register(userData)` | async Function | Registers a new user account |
| `logout()` | Function | Clears AsyncStorage and resets all state |
| `refreshProfile()` | async Function | Re-fetches profile from `/api/profile/` |

**Session persistence flow:**

```
App Launch
  └── loadStoredData()
      ├── Read token from AsyncStorage
      ├── Read user + profile from AsyncStorage
      ├── Set state → user is restored automatically
      └── AppNavigator renders correct navigator (no re-login needed)
```

---

## 🔌 API Integration

All HTTP calls live in `src/api/api.js` — a single Axios instance shared across the entire app.

### Base URL

```js
// ⚠️ Update this to your machine's local IP before running
const BASE_URL = 'http://192.168.1.35:8000/api';
```

### Interceptors

```
Request interceptor:
  └── Reads JWT token from AsyncStorage
  └── Attaches: Authorization: Bearer <token>

Response interceptor:
  └── Logs responses and errors to console (debug mode)
```

### All API Functions

| Function | Method | Endpoint | Description |
|---|---|---|---|
| `login(username, password)` | POST | `/login/` | Authenticate and get JWT |
| `register(userData)` | POST | `/register/` | Create new account |
| `getProfile()` | GET | `/profile/` | Get authenticated user profile |
| `getStudents()` | GET | `/students/` | List students |
| `markAttendance(data)` | POST | `/attendance/` | Submit attendance record |
| `addMarks(data)` | POST | `/marks/` | Submit exam marks |
| `getStudentAttendance(id)` | GET | `/student/:id/attendance/` | Fetch attendance history |
| `getStudentMarks(id)` | GET | `/student/:id/marks/` | Fetch marks records |
| `getNotifications()` | GET | `/notifications/` | Fetch notifications |
| `createNotification(data)` | POST | `/notifications/create/` | Send a notification |
| `getSubjects()` | GET | `/subjects/` | List subjects |
| `createSubject(data)` | POST | `/subjects/` | Create a new subject |
| `updateSubject(id, data)` | PUT | `/subjects/:id/` | Update a subject |
| `deleteSubject(id)` | DELETE | `/subjects/:id/` | Delete a subject |

---

## ⚡ Quick Start

### Prerequisites

![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white&style=flat-square)
![npm](https://img.shields.io/badge/npm-Latest-CB3837?logo=npm&logoColor=white&style=flat-square)
![Expo CLI](https://img.shields.io/badge/Expo%20CLI-Latest-000020?logo=expo&logoColor=white&style=flat-square)

You'll also need:
- **Expo Go** app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) **or** an emulator

### 1️⃣ Clone the Repository

```bash
git clone <repo-url>
cd Student-management-Mobile-APP-frontend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure the API URL

Open `src/api/api.js` and update `BASE_URL` to your machine's local IP:

```js
const BASE_URL = 'http://YOUR_LOCAL_IP:8000/api';
```

### 4️⃣ Start the App

```bash
npm start
```

---

## ⚙️ Configuration

### Finding Your Local IP

| OS | Command | Look for |
|---|---|---|
| Windows | `ipconfig` | `IPv4 Address` under your Wi-Fi adapter |
| macOS | `ifconfig \| grep "inet "` | Address starting with `192.168.x.x` |
| Linux | `hostname -I` | First IP address in output |

> ⚠️ Your **phone and computer must be on the same Wi-Fi network**. Mobile data will not reach your local server.

---

## 🚀 Running the App

```bash
npm start          # Start Expo dev server (scan QR with Expo Go)
npm run android    # Open directly in Android emulator
npm run ios        # Open in iOS simulator (macOS only)
npm run web        # Run in browser (limited functionality)
npm run lint       # Run ESLint checks
```

**With Expo Go:**
1. Run `npm start`
2. Scan the QR code in the terminal with **Expo Go** (Android) or the **Camera** app (iOS)
3. The app loads on your device

---

## 🧩 Reusable Components

| Component | Description |
|---|---|
| `Button.js` | Styled touchable button with loading state and variants |
| `Card.js` | Rounded container with shadow and consistent padding |
| `Header.js` | Screen header with title, optional back button |
| `Input.js` | Styled text input with label and error state |
| `DatePickerWrapper.js` | Cross-platform date picker (iOS & Android) |
| `StudentItem.js` | List row displaying a student's name, roll number, and class |
| `NotificationItem.js` | List row displaying a notification title, message, and date |

---

## 🎨 Colour Palette

Defined in `src/utils/colors.js`:

| Token | Usage |
|---|---|
| `colors.primary` | Primary brand colour for buttons and indicators |
| `colors.teacher` | Active tab tint in TeacherNavigator |
| `colors.student` | Active tab tint in StudentNavigator |
| `colors.gray` | Inactive tab icons and subtle UI elements |

---

## 📝 Notes

- All screens set `headerShown: false` — custom `Header` component is used instead.
- JWT tokens expire after **1 day** (server-side). The app does not auto-refresh tokens; users re-login when the token expires.
- The Axios request timeout is **10 seconds** — adjustable in `src/api/api.js`.
- `SafeAreaProvider` wraps the entire app to handle notches and safe areas on both iOS and Android.

---

## 👤 Author

<div align="center">

[![Author](https://img.shields.io/badge/Sridhar%20Mahalingam-0d47a1?style=for-the-badge)](https://sridharportfolio1.netlify.app/)

[![Email](https://img.shields.io/badge/📧%20EMAIL-sridharansridhar22%40gmail.com-1c1c1c?style=for-the-badge)](mailto:sridharansridhar22@gmail.com)
[![LinkedIn](https://img.shields.io/badge/💼%20LINKEDIN-Sridhar%20Mahalingam-1c1c1c?style=for-the-badge)](https://www.linkedin.com/in/sridhar-mahalingam-6b8357245)
[![Portfolio](https://img.shields.io/badge/🌐%20WEBSITE-sridharportfolio1.netlify.app-1c1c1c?style=for-the-badge)](https://sridharportfolio1.netlify.app/)

</div>

---

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:66bb6a,100:1b5e20&height=120&section=footer&text=Built%20with%20React%20Native%20%26%20Expo&fontSize=18&fontColor=ffffff&fontAlignY=65" width="100%"/>
</div>
