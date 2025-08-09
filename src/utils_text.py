# src/utils_text.py 
# Utilitários de texto
import re

def clean(txt: str) -> str:
    if not isinstance(txt, str):
        return ""
    txt = re.sub(r"<[^>]+>", " ", txt)
    txt = re.sub(r"\s+", " ", txt).strip()
    return txt

def build_context_text(texto: str, author_role: str = "", target_type: str = "", course_code: str = "") -> str:
    role = (author_role or "").strip().lower()
    tgt = (target_type or "").strip().lower()
    course = (course_code or "").strip()
    parts = [f"[ROLE={role}]", f"[TARGET={tgt}]"]  
    if course:
        parts.append(f"[COURSE={course}]")
    return " ".join(parts + [clean(texto)]).strip()
