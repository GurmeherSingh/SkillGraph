# SkillGraph AI

**SkillGraph AI** is a powerful tool designed to help you visualize your career path, identify skill gaps, and generate a personalized study plan to achieve your professional goals. Simply upload your resume, select your target role, and let our AI-powered engine do the rest.

## 📸 Demo

<p align="center">
  <img alt="SkillGraph AI - Main Interface" src="assets/img1.png" width="48%">
  &nbsp;&nbsp;
  <img alt="SkillGraph AI - Study Plan" src="assets/img2.png" width="48%">
  &nbsp;&nbsp;
  <img alt="SkillGraph AI - Study Plan" src="assets/img3.png" width="48%">
  &nbsp;&nbsp;
  <img alt="SkillGraph AI - Study Plan" src="assets/img4.png" width="48%">
  &nbsp;&nbsp;
  <img alt="SkillGraph AI - Study Plan" src="assets/img5.png" width="48%">
</p>

## ✨ Features

*   **📄 Resume Parsing:** Automatically extracts your skills, tools, and past roles from your PDF resume.
*   **🎯 Skill Gap Analysis:** Compares your current skillset with the requirements of your target role to identify what you need to learn.
*   **🗺️ Interactive Skill Graph:** Visualizes the relationship between your current skills and the skills you need to acquire, helping you understand your learning journey.
*   **🤖 AI-Powered Study Plan:** Generates a comprehensive 6-month, week-by-week study plan with curated resources to help you bridge your skill gaps.
*   **⬇️ PDF Export:** Allows you to download your personalized study plan as a PDF for offline access.

## 🚀 Tech Stack

### Frontend

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool and development server for modern web projects.
*   **Material-UI (MUI):** A popular React UI framework for building beautiful and responsive applications.
*   **Axios:** A promise-based HTTP client for making API requests.
*   **Mermaid:** A JavaScript-based diagramming and charting tool used to render the skill graph.

### Backend

*   **FastAPI:** A modern, fast (high-performance) web framework for building APIs with Python 3.7+.
*   **Pydantic:** Data validation and settings management using Python type annotations.
*   **Uvicorn:** An ASGI server for running FastAPI applications.
*   **Gemini:** Used for the AI-powered features like resume parsing and study plan generation.
*   **PyPDF:** A library for extracting text from PDF files.
*   **ReportLab:** A library for creating PDF documents programmatically.

## 🏁 Getting Started

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/SkillGraph.git
    cd SkillGraph
    ```

2.  **Backend Setup:**
    *   Navigate to the `backend` directory:
        ```bash
        cd backend
        ```
    *   Create a virtual environment and activate it:
        ```bash
        python -m venv .venv
        source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`
        ```
    *   Install the required Python packages:
        ```bash
        pip install -r requirements.txt
        ```
    *   Create a `.env` file in the `backend` directory and add your OpenAI API key:
        ```
        OPENAI_API_KEY="your-openai-api-key"
        ```

3.  **Frontend Setup:**
    *   Navigate to the `frontend` directory:
        ```bash
        cd ../frontend
        ```
    *   Install the required npm packages:
        ```bash
        npm install
        ```

### Running the Application

1.  **Start the Backend Server:**
    *   From the `backend` directory, run:
        ```bash
        uvicorn main:app --reload
        ```
    *   The backend server will be running at `http://localhost:8000`.

2.  **Start the Frontend Development Server:**
    *   From the `frontend` directory, run:
        ```bash
        npm run dev
        ```
    *   The frontend application will be running at `http://localhost:5173`.

3.  Open your browser and navigate to `http://localhost:5173` to use the application.

## ⚙️ API Endpoints

The backend exposes the following API endpoints:

*   `POST /parse_resume`: Upload a PDF resume to extract skills, tools, and roles.
*   `POST /compare_skills`: Compare the user's current skills with a target role to find skill gaps and generate a skill graph.
*   `POST /generate_plan`: Generate a 6-month study plan based on the identified skill gaps.
*   `POST /export_plan_pdf`: Export the generated study plan as a PDF file.

## 📂 Project Structure

```
SkillGraph/
├── backend/
│   ├── main.py             # FastAPI application
│   ├── ai_utils.py         # Utilities for interacting with OpenAI
│   ├── role_templates.json # Pre-defined role templates
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Entry point for the React app
│   ├── package.json        # Node.js dependencies
│   └── vite.config.js      # Vite configuration
└── README.md
```

## 🖼️ Screenshots

*(Add screenshots of your application here to showcase its features and UI.)*

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
