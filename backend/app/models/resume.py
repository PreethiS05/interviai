from pydantic import BaseModel
from typing import List


class Education(BaseModel):
    institution: str
    duration: str
    course: str
    grade: str


class Experience(BaseModel):
    organization: str
    duration: str
    role: str


class Project(BaseModel):
    name: str
    description: str
    technologies: List[str]


class Resume(BaseModel):
    name: str
    skills: List[str]
    education: List[Education]
    experience: List[Experience]
    projects: List[Project]
    certifications: List[str]