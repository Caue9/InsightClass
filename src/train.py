import re
import argparse
import joblib
import pandas as pd
from collections import Counter
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import classification_report
from sklearn.feature_extraction.text import TfidfVectorizer

REQUIRED_COLS = {"texto", "label", "author_role", "target_type"}
OPTIONAL_COLS = {"course_code"}

def clean(txt: str) -> str:
    """Limpa html e espaços. Mantém acentos e gírias."""
    if not isinstance(txt, str):
        return ""
    txt = re.sub(r"<[^>]+>", " ", txt)      # remove HTML
    txt = re.sub(r"\s+", " ", txt).strip()  # normaliza espaços
    return txt

def make_context_row(row) -> str:
    """Concatena contexto no início do texto: [ROLE=aluno] [TARGET=professor] [COURSE=MAT-101] ..."""
    role = str(row.get("author_role", "") or "").strip().lower()
    tgt  = str(row.get("target_type", "") or "").strip().lower()
    course = str(row.get("course_code", "") or "").strip()
    parts = [f"[ROLE={role}]", f"[TARGET={tgt}]"]
    if course:
        parts.append(f"[COURSE={course}]")
    return " ".join(parts + [clean(row["texto"])]).strip()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default="/home/caue/Projeto/data/rotulados_ensino_medio.csv", help="Caminho do CSV rotulado")
    ap.add_argument("--out", default="models/sentiment.joblib", help="Arquivo de saída do modelo")
    args = ap.parse_args()

    # 1) Carrega
    df = pd.read_csv(args.csv)
    if not REQUIRED_COLS.issubset(df.columns):
        raise ValueError(f"CSV precisa conter as colunas: {REQUIRED_COLS}. Encontradas: {set(df.columns)}")

    # 2) Cria texto com contexto
    df["texto_ctx"] = df.apply(make_context_row, axis=1)

    # (Opcional) sanity check de distribuição
    dist = Counter(df["label"])
    print("Distribuição de labels:", dict(dist))

    # 3) Split
    X = df["texto_ctx"]
    y = df["label"].astype(str)

    Xtr, Xte, ytr, yte = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 4) Pipeline TF-IDF + SVM
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),   # unigrama + bigrama
            min_df=2,             # ignora termos muito raros
            max_df=0.95           # ignora termos muito frequentes
        )),
        ("clf", LinearSVC())
    ])

    # 5) Validação cruzada rápida (5-fold estratificada)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(pipe, X, y, cv=cv, scoring="f1_macro", n_jobs=-1)
    print(f"CV 5-fold F1-macro: {scores.mean():.3f} ± {scores.std():.3f}")

    # 6) Treina e avalia no hold-out
    pipe.fit(Xtr, ytr)
    ypred = pipe.predict(Xte)
    print("\nRelatório (hold-out 20%):")
    print(classification_report(yte, ypred, digits=3))

    # 7) Salva o modelo
    joblib.dump(pipe, args.out)
    print(f"\n✅ Modelo salvo em: {args.out}")

if __name__ == "__main__":
    main()