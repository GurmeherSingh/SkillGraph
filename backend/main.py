import json
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import pypdf
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT

from ai_utils import get_completion

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class ResumeParseResponse(BaseModel):
    skills: List[str]
    tools: List[str]
    roles: List[str]

class SkillCompareRequest(BaseModel):
    current_skills: List[str]
    target_role: str

class SkillCompareResponse(BaseModel):
    skill_gaps: List[str]
    skill_graph: str # Mermaid graph definition

class PlanGenerateRequest(BaseModel):
    skill_gaps: List[str]

class PlanGenerateResponse(BaseModel):
    study_plan: Dict[str, Any]

class PdfExportRequest(BaseModel):
    study_plan: Dict[str, Any]


# --- Load Role Templates ---
with open("role_templates.json", "r") as f:
    role_templates = json.load(f)


# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to SkillGraph AI"}

@app.post("/parse_resume", response_model=ResumeParseResponse)
async def parse_resume(file: UploadFile = File(...)):
    # Only accept PDF files
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    try:
        content = await file.read()
        text = ""
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        for page in pdf_reader.pages:
            text += page.extract_text()

        prompt = f"""
        Analyze the following resume text and extract the skills, tools, and past roles.
        Return the result as a JSON object with three keys: "skills", "tools", and "roles".
        - "skills": A list of technical skills (e.g., Python, JavaScript, SQL).
        - "tools": A list of software tools and platforms (e.g., Git, Docker, Jira).
        - "roles": A list of job titles held by the person (e.g., Software Engineer, Project Manager).

        Resume Text:
        ---
        {text}
        ---

        JSON Output:
        """

        response_str = await get_completion(prompt)

        try:
            response_json = json.loads(response_str)
            return response_json
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@app.post("/compare_skills", response_model=SkillCompareResponse)
async def compare_skills(request: SkillCompareRequest):
    # ... (code for comparing skills, unchanged)
    target_role_data = role_templates.get(request.target_role)
    if not target_role_data:
        raise HTTPException(status_code=404, detail="Target role not found.")

    required_skills = set(target_role_data["required_skills"])
    current_skills = set(request.current_skills)
    skill_gaps = list(required_skills - current_skills)

    prompt = f"""
    Given a list of current skills and a list of skill gaps, generate a Mermaid.js graph definition.
    The graph should show the relationships between the skills, with existing skills as prerequisites for missing skills where appropriate.
    - Current skills should be styled differently (e.g., with a thicker border or different color).
    - Skill gaps should be clearly identifiable.
    - The graph should be a flowchart (graph TD).

    Current Skills: {list(current_skills)}
    Skill Gaps: {skill_gaps}

    Example of a Mermaid.js graph definition:
    graph TD
        A[Current Skill: Python] --> B(Gap: Machine Learning);
        C[Current Skill: SQL] --> D(Gap: Big Data);
        style A fill:#cfc,stroke:#333,stroke-width:2px
        style C fill:#cfc,stroke:#333,stroke-width:2px

    Mermaid.js Graph Definition:
    """

    graph_definition = await get_completion(prompt)

    return {
        "skill_gaps": skill_gaps,
        "skill_graph": graph_definition,
    }

@app.post("/generate_plan", response_model=PlanGenerateResponse)
async def generate_plan(request: PlanGenerateRequest):
    # ... (code for generating plan, unchanged)
    prompt = f"""
    You are an expert career coach. Create a personalized 6-month (24-week) study plan for a user trying to fill the following skill gaps:
    {request.skill_gaps}

    Structure the plan in a logical order, grouping related skills into weekly or bi-weekly modules.
    For each module, provide:
    1. The skill(s) to focus on.
    2. 1-2 top-quality, free online resources (like tutorials, documentation, or videos) with URLs.
    3. An estimated time commitment for the week.

    Return the result as a JSON object where keys are the weekly phases (e.g., "Week 1-2") and values are another object with "focus", "resources", and "time_commitment".

    Example JSON output format:
    {{
      "Week 1-2: Introduction to Topic A": {{
        "focus": "Topic A fundamentals",
        "resources": [
          {{"name": "Resource Name 1", "url": "http://example.com/resource1"}},
          {{"name": "Resource Name 2", "url": "http://example.com/resource2"}}
        ],
        "time_commitment": "5-7 hours/week"
      }},
      "Week 3-4: Advanced Topic B": {{
        "focus": "Advanced concepts in Topic B",
        "resources": [
          {{"name": "Resource Name 3", "url": "http://example.com/resource3"}}
        ],
        "time_commitment": "6-8 hours/week"
      }}
    }}

    JSON Output:
    """

    response_str = await get_completion(prompt)
    try:
        study_plan = json.loads(response_str)
        return {"study_plan": study_plan}
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response for the study plan.")

@app.post("/export_plan_pdf")
async def export_plan_pdf(request: PdfExportRequest):
    """
    Generates a PDF document from the study plan and returns it as a stream.
    This version uses ReportLab's Platypus for better flow control and text wrapping.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=inch, leftMargin=inch,
                            topMargin=inch, bottomMargin=inch)
    
    styles = getSampleStyleSheet()
    # Add a custom style for URLs to make them more readable
    styles.add(ParagraphStyle(name='URLStyle', parent=styles['Normal'], textColor='blue', wordWrap='CJK'))

    story = []

    # Title
    story.append(Paragraph("Your 6-Month Study Roadmap", styles['h1']))
    story.append(Spacer(1, 0.25 * inch))

    # Plan content
    for week, details in request.study_plan.items():
        # Module Title
        story.append(Paragraph(week, styles['h3']))
        story.append(Spacer(1, 0.1 * inch))

        # Details
        story.append(Paragraph(f"<b>Focus:</b> {details.get('focus', 'N/A')}", styles['Normal']))
        story.append(Paragraph(f"<b>Time Commitment:</b> {details.get('time_commitment', 'N/A')}", styles['Normal']))
        story.append(Spacer(1, 0.1 * inch))

        # Resources
        story.append(Paragraph("<b>Resources:</b>", styles['Normal']))
        for resource in details.get('resources', []):
            # Using Paragraphs allows for automatic line wrapping of long URLs
            resource_text = f"- <a href='{resource.get('url', '#')}'>{resource.get('name', 'Unnamed Resource')}</a>"
            story.append(Paragraph(resource_text, styles['URLStyle']))

        story.append(Spacer(1, 0.25 * inch))

    try:
        doc.build(story)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={
        "Content-Disposition": "attachment;filename=study_plan.pdf"
    })
