
# Sentiment Baseline (PT-BR) — TF-IDF + SVM

Modelo simples para classificar feedback de aulas em **positivo**, **negativo** ou **neutro**.

## Como usar

1. **Instale as dependências** (de preferência em um ambiente virtual):
   ```bash
   pip install -r requirements.txt
   ```

2. Prepare seus dados: edite `rotulados.csv` com as colunas:
   - `texto` → conteúdo do feedback
   - `label` → `positivo` | `negativo` | `neutro`

3. **Treine**:
   ```bash
   python train.py
   ```

4. **Saída**:
   - `sentiment.joblib` — arquivo com o modelo treinado
   - Relatório simples de avaliação no terminal

> Dica: comece com ~300–1000 exemplos equilibrados entre as 3 classes.

## Próximos passos
- Trocar SVM por Logistic Regression com probabilidades.
- Evoluir para BERTimbau (Transformers) mantendo o mesmo contrato de API.