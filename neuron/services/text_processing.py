from io import BytesIO
import re
import PyPDF2
from config import NLP, STOP_WORDS, PUNCT

def extract_text_from_pdf_bytes(file_bytes) -> str:
    reader = PyPDF2.PdfReader(file_bytes)
    return "\n".join([page.extract_text() or "" for page in reader.pages])

def preprocess_text(text: str) -> str:
    text = text.lower()
    doc = NLP(text)
    tokens = [t.text for t in doc if t.text not in STOP_WORDS and t.text not in PUNCT and not t.is_space]
    return " ".join(tokens)

def normalize_skill(skill: str) -> str:
    return re.sub(r"\s+", " ", skill.strip().lower())

def extract_skills(text: str, seeded_skills = None) -> list[str]:
    doc = NLP(text.lower())
    found = set()
    seeds = seeded_skills or []

    for seed in seeds:
        normalized = normalize_skill(seed)
        if normalized:
            found.add(normalized)

    for ent in doc.ents:
        if ent.label_ in {"ORG", "PRODUCT", "WORK_OF_ART"}:
            skill = normalize_skill(ent.text)
            if 1 < len(skill) <= 40:
                found.add(skill)

    technical_phrases = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.\-/]{1,30}", text)
    for phrase in technical_phrases:
        skill = normalize_skill(phrase)
        if skill and any(ch.isalpha() for ch in skill) and len(skill) > 1:
            found.add(skill)

    return sorted(found)
