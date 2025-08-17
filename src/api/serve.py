# src/api/serve.py

import joblib
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from ..utils_text import build_context_text

MODEL_PATH = os.getenv("MODEL_PATH", "models/sentiment.joblib")
API_VERSION = "0.2.0"

app = FastAPI(
    title="InsightClass Sentiment API",
    version=API_VERSION,
    description="API para análise de sentimento de feedbacks escolares."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Não foi possível carregar o modelo em {MODEL_PATH}: {e}")

class PredictItem(BaseModel):
    texto: str = Field(..., min_length=3, description="Feedback em texto")
    author_role: Optional[str] = Field(default="aluno", description="aluno|professor|coordenador")
    target_type: Optional[str] = Field(default="professor", description="professor|curso|turma|coordenacao")
    course_code: Optional[str] = Field(default="", description="ex.: MAT-101 (opcional)")

class PredictResponse(BaseModel):
    label: str
    confidence: Optional[float] = None

class PredictBatchRequest(BaseModel):
    items: List[PredictItem]

class PredictBatchResponseItem(BaseModel):
    index: int
    label: str
    confidence: Optional[float] = None

class PredictBatchResponse(BaseModel):
    results: List[PredictBatchResponseItem]

@app.get("/health", summary="Verifica a saúde da API")
def health():
    return {"status": "ok", "model_loaded": True}

@app.get("/version", summary="Retorna a versão da API e do modelo")
def version():
    return {"api_version": API_VERSION, "model_path": MODEL_PATH}

@app.post("/predict", response_model=PredictResponse, summary="Prevê o sentimento de um único texto")
def predict(item: PredictItem):
    try:
        text_ctx = build_context_text(
            texto=item.texto,
            author_role=item.author_role,
            target_type=item.target_type,
            course_code=item.course_code
        )
        
        text_list = [text_ctx]
        label = model.predict(text_list)[0]
        
        conf = None
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(text_list)[0]
            conf = float(max(probabilities))

        return {"label": str(label), "confidence": conf}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro na predição: {e}")

@app.post("/predict_batch", response_model=PredictBatchResponse, summary="Prevê o sentimento de múltiplos textos")
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