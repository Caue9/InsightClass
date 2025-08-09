# src/api/serve.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import os
from typing import List, Optional
from ..utils_text import build_context_text

# ========= Config =========
MODEL_PATH = os.getenv("MODEL_PATH", "models/sentiment.joblib")
API_VERSION = "0.1.0"

# ========= App =========
app = FastAPI(title="Sentiment API (PT-BR)", version=API_VERSION)

# CORS (libera front local e depois seu domínio)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========= Modelo =========
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Não foi possível carregar o modelo em {MODEL_PATH}: {e}")

# ========= Schemas =========
class PredictItem(BaseModel):
    texto: str = Field(..., min_length=1, description="Feedback em texto")
    author_role: Optional[str] = Field(default="aluno", description="aluno|professor|coordenador")
    target_type: Optional[str] = Field(default="professor", description="professor|curso|turma|coordenacao")
    course_code: Optional[str] = Field(default="", description="ex.: MAT-101 (opcional)")

class PredictResponse(BaseModel):
    label: str
    confidence: Optional[float] = None  # só terá valor se usar modelo com probas (LogReg)

class PredictBatchRequest(BaseModel):
    items: List[PredictItem]

class PredictBatchResponseItem(BaseModel):
    index: int
    label: str
    confidence: Optional[float] = None

class PredictBatchResponse(BaseModel):
    results: List[PredictBatchResponseItem]

# ========= Endpoints =========
@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": True}

@app.get("/version")
def version():
    return {"api_version": API_VERSION, "model_path": MODEL_PATH}

@app.post("/predict", response_model=PredictResponse)
def predict(item: PredictItem):
    try:
        text_ctx = build_context_text(
            texto=item.texto,
            author_role=item.author_role,
            target_type=item.target_type,
            course_code=item.course_code
        )
        label = model.predict([text_ctx])[0]

        # Tenta probabilidade se o modelo suportar
        conf = None
        if hasattr(model, "predict_proba"):
            conf = float(max(model.predict_proba([text_ctx])[0]))

        return {"label": str(label), "confidence": conf}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro na predição: {e}")

@app.post("/predict_batch", response_model=PredictBatchResponse)
def predict_batch(payload: PredictBatchRequest):
    try:
        texts = [
            build_context_text(i.texto, i.author_role, i.target_type, i.course_code)
            for i in payload.items
        ]
        labels = model.predict(texts)

        confs = None
        if hasattr(model, "predict_proba"):
            confs = model.predict_proba(texts).max(axis=1)

        results = []
        for idx, lab in enumerate(labels):
            results.append(PredictBatchResponseItem(
                index=idx,
                label=str(lab),
                confidence=float(confs[idx]) if confs is not None else None
            ))
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro na predição em lote: {e}")