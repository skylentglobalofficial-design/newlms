export type CareerEvidenceMap = {
  lessonId: string
  learning: string
  artifact: string
  skill: string
  evidence: string
}

export const DS_CAREER_EVIDENCE: CareerEvidenceMap[] = [
  {
    lessonId: 'l6',
    learning: 'Leakage-free preprocessing and feature engineering pipelines',
    artifact: 'Scikit-learn ColumnTransformer credit risk preprocessor',
    skill: 'Data Science, Feature Engineering, Scikit-learn, Data Leakage Prevention',
    evidence: 'A reviewer can verify strict train/test isolation and clean imputation transforms',
  },
  {
    lessonId: 'l12',
    learning: 'Ensemble modeling and hyperparameter optimization',
    artifact: 'Tuned gradient boosted churn classification pipeline',
    skill: 'Machine Learning, XGBoost, Cross-Validation, Feature Importance Analysis',
    evidence: 'A reviewer can inspect cross-validation matrices and precision-recall trade-offs',
  },
  {
    lessonId: 'l14',
    learning: 'Production ML pipeline serialization and threshold tuning',
    artifact: 'End-to-end predictive pipeline capstone with serialized artifact',
    skill: 'MLOps, Model Evaluation, Pipeline Architecture, Business Threshold Optimization',
    evidence: 'A complete GitHub portfolio project with passing reproducible execution',
  },
]
