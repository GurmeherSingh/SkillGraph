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

class Resource(BaseModel):
    name: str
    url: str

class WeeklyModule(BaseModel):
    focus: str
    resources: List[Resource]
    time_commitment: str

class StudyPlan(BaseModel):
    study_plan: Dict[str, WeeklyModule]

class PlanGenerateResponse(StudyPlan):
    pass

class PdfExportRequest(BaseModel):
    study_plan: Dict[str, WeeklyModule]


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
        - "skills": A list of technical skills (e.g., Python, JavaScript, SQL).
        - "tools": A list of software tools and platforms (e.g., Git, Docker, Jira).
        - "roles": A list of job titles held by the person (e.g., Software Engineer, Project Manager).

        Resume Text:
        ---
        {text}
        ---
        """

        # Use the JSON mode of the AI
        response_str = await get_completion(prompt, response_schema=ResumeParseResponse)
        
        # The response is now a JSON string, so we can parse it directly.
        # The AI is constrained by the schema, so JSONDecodeError is highly unlikely.
        try:
            return json.loads(response_str)
        except json.JSONDecodeError:
            # In case the model *still* messes up, which is rare with JSON mode.
            raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON despite using JSON mode.")

    except Exception as e:
        # Log the exception for debugging
        print(f"Error processing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@app.post("/compare_skills", response_model=SkillCompareResponse)
async def compare_skills(request: SkillCompareRequest):
    import re

    # Step 1: Resolve required skills
    target_role_data = role_templates.get(request.target_role)
    if target_role_data:
        required_skills = set(target_role_data["required_skills"])
    else:
        # Fallback: use LLM to extract skills from free-text role name/description
        extract_prompt = f"""
        You are an expert in skill mapping.
        Given the target role description below, return ONLY a JSON array of relevant skills.
        Do not include explanations or other text.
        
        Role: {request.target_role}
        """
        skills_raw = await get_completion(extract_prompt)
        import json
        try:
            required_skills = set(json.loads(skills_raw))
        except json.JSONDecodeError:
            required_skills = set()

    current_skills = list(request.current_skills)  # preserve order
    skill_gaps = sorted(list(required_skills - set(current_skills)))

    # Helper: tokenize for simple semantic matching
    def tokens(s: str):
        return set(re.findall(r"\w+", (s or "").lower()))

    # Determine best current-skill match for each gap (fallback to first current skill)
    edges_pairs = []
    if current_skills:
        for gap in skill_gaps:
            best = None
            best_score = 0
            gap_tokens = tokens(gap)
            for cur in current_skills:
                score = len(gap_tokens & tokens(cur))
                if score > best_score:
                    best_score = score
                    best = cur
            if best is None:
                best = current_skills[0]
            edges_pairs.append((best, gap))

    # Build deterministic list of nodes: current skills first, then gaps
    nodes_ordered = []
    for s in current_skills:
        if s not in nodes_ordered:
            nodes_ordered.append(s)
    for s in skill_gaps:
        if s not in nodes_ordered:
            nodes_ordered.append(s)

    if not nodes_ordered:
        empty_graph = "graph TD\n    A[No skills provided]"
        return {"skill_gaps": skill_gaps, "skill_graph": empty_graph}

    # Create safe IDs
    id_map = {}
    def make_id(i):
        return f"N{i+1}"
    for i, lbl in enumerate(nodes_ordered):
        id_map[lbl] = make_id(i)

    # Escape labels for Mermaid
    def esc(lbl: str) -> str:
        return lbl.replace('"', '\\"').replace("\n", " ").strip()

    lines = ["graph TD"]
    for lbl in nodes_ordered:
        lines.append(f'{id_map[lbl]}["{esc(lbl)}"]')

    for left_lbl, right_lbl in edges_pairs:
        if left_lbl not in id_map:
            id_map[left_lbl] = make_id(len(id_map))
            lines.append(f'{id_map[left_lbl]}["{esc(left_lbl)}"]')
        if right_lbl not in id_map:
            id_map[right_lbl] = make_id(len(id_map))
            lines.append(f'{id_map[right_lbl]}["{esc(right_lbl)}"]')
        lines.append(f'{id_map[left_lbl]} --> {id_map[right_lbl]}')

    for lbl in nodes_ordered:
        nid = id_map[lbl]
        color = "#9f9" if lbl in current_skills else "#ff9"
        lines.append(f"style {nid} fill:{color}")

    graph = "\n".join(lines)
    return {"skill_gaps": skill_gaps, "skill_graph": graph}


@app.post("/generate_plan", response_model=PlanGenerateResponse)
async def generate_plan(request: PlanGenerateRequest):
    prompt = f"""
    You are an expert career coach. Create a personalized 6-month (24-week) study plan for a user trying to fill the following skill gaps:
    {request.skill_gaps}

    Structure the plan in a logical order, grouping related skills into weekly or bi-weekly modules.
    For each module, provide:
    1. The skill(s) to focus on.
    2. 1-2 top-quality, free online resources (like tutorials, documentation, or videos) with URLs.
    3. An estimated time commitment for the week.
    
    The keys for the main JSON object should be the weekly phases (e.g., "Week 1-2: Introduction to Topic A").
    """

    response_str = await get_completion(prompt, response_schema=StudyPlan)
    try:
        # The response is a JSON string. We load it into a Python dict.
        study_plan_dict = json.loads(response_str)
        # FastAPI will automatically validate and serialize this according to PlanGenerateResponse
        return study_plan_dict
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response for the study plan despite using JSON mode.")

@app.post("/export_plan_pdf")
async def export_plan_pdf(request: PdfExportRequest):
    """
    Generates a PDF document from the study plan and returns it as a stream.
    Handles any valid study plan dict, even if fields are missing or malformed.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=inch, leftMargin=inch,
                            topMargin=inch, bottomMargin=inch)

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='URLStyle', parent=styles['Normal'], textColor='blue', wordWrap='CJK'))

    story = []
    story.append(Paragraph("Your 6-Month Study Roadmap", styles['h1']))
    story.append(Spacer(1, 0.25 * inch))

    plan = request.study_plan
    if not isinstance(plan, dict):
        plan = {}

    for week, details in plan.items():
        story.append(Paragraph(str(week), styles['h3']))
        story.append(Spacer(1, 0.1 * inch))

        # Details: handle both dict and object
        focus = details.get('focus', 'N/A') if isinstance(details, dict) else getattr(details, 'focus', 'N/A')
        time_commitment = details.get('time_commitment', 'N/A') if isinstance(details, dict) else getattr(details, 'time_commitment', 'N/A')
        resources = details.get('resources', []) if isinstance(details, dict) else getattr(details, 'resources', [])

        story.append(Paragraph(f"<b>Focus:</b> {focus}", styles['Normal']))
        story.append(Paragraph(f"<b>Time Commitment:</b> {time_commitment}", styles['Normal']))
        story.append(Spacer(1, 0.1 * inch))

        story.append(Paragraph("<b>Resources:</b>", styles['Normal']))
        for resource in resources:
            # Handle both dict and object
            name = resource.get('name', 'Unnamed Resource') if isinstance(resource, dict) else getattr(resource, 'name', 'Unnamed Resource')
            url = resource.get('url', '#') if isinstance(resource, dict) else getattr(resource, 'url', '#')
            resource_text = f"- <a href='{url}'>{name}</a>"
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
