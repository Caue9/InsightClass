# train.py

import argparse
import joblib
import pandas as pd
from collections import Counter
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.metrics import classification_report
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from utils_text import build_context_text


REQUIRED_COLS = {"texto", "label", "author_role", "target_type"}
RANDOM_STATE = 42

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default="data/rotulados_ensino_medio.csv", help="Caminho do CSV rotulado")
    ap.add_argument("--out", default="models/sentiment.joblib", help="Arquivo de saída do modelo")
    args = ap.parse_args()

    df = pd.read_csv(args.csv)
    if not REQUIRED_COLS.issubset(df.columns):
        raise ValueError(f"CSV precisa conter as colunas: {REQUIRED_COLS}. Encontradas: {set(df.columns)}")

    df["texto_ctx"] = df.apply(
        lambda row: build_context_text(
            texto=row["texto"],
            author_role=row.get("author_role"),
            target_type=row.get("target_type"),
            course_code=row.get("course_code")
        ),
        axis=1
    )

    dist = Counter(df["label"])
    print("Distribuição de labels:", dict(dist))

    X = df["texto_ctx"]
    y = df["label"].astype(str)

    Xtr, Xte, ytr, yte = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(lowercase=True)),
        ("clf", LogisticRegression(random_state=RANDOM_STATE, max_iter=1000))
    ])

    parameters = {
        'tfidf__ngram_range': [(1, 1), (1, 2)],
        'tfidf__min_df': [2, 3, 5],
        'clf__C': [0.1, 1, 10],
        'clf__solver': ['liblinear'],
    }
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    grid_search = GridSearchCV(pipe, parameters, cv=cv, scoring="f1_macro", n_jobs=-1, verbose=1)

    print("Iniciando a busca por hiperparâmetros...")
    grid_search.fit(Xtr, ytr)

    print("\nMelhores parâmetros encontrados: ", grid_search.best_params_)
    print(f"Melhor score F1-macro (validação cruzada): {grid_search.best_score_:.3f}")

    print("\nRelatório (hold-out 20%) com o melhor modelo:")
    best_model = grid_search.best_estimator_
    ypred = best_model.predict(Xte)
    print(classification_report(yte, ypred, digits=3))

    joblib.dump(best_model, args.out)
    print(f"\n✅ Melhor modelo salvo em: {args.out}")


if __name__ == "__main__":
    main()