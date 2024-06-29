# Task Management App
![Visitor Badge](https://visitor-badge.laobi.icu/badge?page_id=coollad49.task-management-dashboard-application)
## Introduction

The Task Management Dashboard Application is a comprehensive tool designed to help individuals manage their tasks efficiently. It provides a user-friendly interface for creating, tracking, and organizing tasks. The application supports functionalities such as drag-and-drop task management, priority setting, and due date tracking, making it an essential tool for project management and daily task tracking.

## Features

- User Authentication (Sign Up, Login, Logout)
- Create, Update, and Delete Tasks
- Task Status Tracking (Pending, In Progress, Completed)
- Responsive Design using TailwindCSS, Jquery
- User-friendly Interface
- Drag & Drop functionality using JqueryUI

## Installation

Follow these steps to set up the project locally.

### Prerequisites

- Python 3.x
- pip (Python package installer)
- Node.js (for TailwindCSS)
- npm (Node package manager)
- Internet connection for Jquery API

## Setting up the Backend
## Create a Virtual Environment
### On macOS/Linux
```bash
pip install virtualenv
virtualenv tma
source tma/bin/activate
```
### On Windows
```bash
pip install virtualenv
virtualenv tma
tma\Scripts\activate
```
### Clone the Repository

```bash
git clone https://github.com/coollad49/task-management-dashboard-application.git
cd task-management-dashboard-application
```

### Install Dependencies

```bash
pip install -r requirements.txt
```
### Run Migrations
```bash
python manage.py migrate
```
## Setting up the Frontend

### Install TailwindCSS and Other Dependencies
```bash
npm install
```
### Compile TailwindCSS
```bash
npm run build
```
### Run the Development Server
```bash
python manage.py runserver
```
# on linux, run python3 manage.py runserver
## Usage

1. Open your browser and go to [http://127.0.0.1:8000/](http://127.0.0.1:8000/).
2. Register a new user or log in with existing credentials.
3. Create, update, and manage your tasks.
4. Applying Filters: After selecting your desired filters, click the "Filter" button to apply them.
5. Applying Sorting: After choosing your sorting criteria, click the "Sort" button to sort the tasks accordingly.
6. Editing a Task: Double-click the pen icon on the task to edit it.
7. Changing Task Status: Drag the task to the desired status column to change its status.


