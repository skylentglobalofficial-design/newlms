import type { AssignmentBrief } from '../data-analytics/assignments'

const pasteNote =
  'This LMS records a text/code submission. Paste your complete, runnable Python script along with validation metrics and analysis. Ensure all pipelines avoid data leakage.'

export const DS_ASSIGNMENTS: Record<string, AssignmentBrief> = {
  l6: {
    id: 'l6',
    title: 'Feature Pipeline — Credit Risk Preprocessor',
    scenario: 'You are an ML engineer building the automated feature pipeline for a retail lending institution. The raw extract contains numerical features (debt ratio, income), categorical indicators (employment type, housing), and missing values. The pipeline must be fully exportable without data leakage.',
    objective: 'Author a scikit-learn ColumnTransformer pipeline incorporating imputation, scaling, and one-hot encoding with strict train/test separation.',
    instructions: [
      'Split data into train and test sets before any transformation occurs.',
      'Construct a Pipeline for numeric features using SimpleImputer(strategy="median") and RobustScaler.',
      'Construct a Pipeline for categorical features using SimpleImputer(strategy="most_frequent") and OneHotEncoder(handle_unknown="ignore").',
      'Combine them using ColumnTransformer and fit strictly on the training set.',
      'Verify that transforming the test set uses training set parameters without leakage.',
    ],
    requiredOutput: [
      'Complete runnable Python script defining the pipeline.',
      'Verification check proving zero NaN values remain after transformation.',
      'Output shape confirmation for both train and test matrices.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      { criterion: 'Leakage Prevention', weight: '35%', description: 'Pipeline is fitted strictly on the training partition without test set contamination.' },
      { criterion: 'Pipeline Architecture', weight: '35%', description: 'ColumnTransformer cleanly separates numeric and categorical streams.' },
      { criterion: 'Code Quality', weight: '30%', description: 'Clean, idiomatic Python using standard scikit-learn best practices.' },
    ],
  },
  l12: {
    id: 'l12',
    title: 'Ensemble Model — Churn Prediction Pipeline',
    scenario: 'A telecommunications company loses 2% of subscribers monthly. The marketing team requires a machine learning model that predicts churn probability and identifies the top actionable customer risk drivers.',
    objective: 'Train and tune a Gradient Boosted Classifier (XGBoost/LightGBM/HistGradientBoosting) with cross-validation and feature importance analysis.',
    instructions: [
      'Integrate the preprocessing pipeline with an ensemble classifier.',
      'Tune hyperparameters (max_depth, learning_rate, n_estimators) using StratifiedKFold.',
      'Extract and rank feature importances (or permutation importances).',
      'Compute precision, recall, and ROC-AUC on the held-out test set.',
      'Write a 2-paragraph operational summary explaining the top churn drivers to business leadership.',
    ],
    requiredOutput: [
      'Runnable model training and evaluation script.',
      'Cross-validation score table across hyperparameter combinations.',
      'Test set evaluation metrics (Precision, Recall, ROC-AUC).',
      'Executive interpretation memo explaining top 3 risk factors.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      { criterion: 'Hyperparameter Tuning & CV', weight: '30%', description: 'Rigorous cross-validation without test set contamination.' },
      { criterion: 'Model Performance & Evaluation', weight: '35%', description: 'Accurate calculation and interpretation of precision-recall metrics.' },
      { criterion: 'Business Interpretation', weight: '35%', description: 'Clear translation of model feature importances into actionable business recommendations.' },
    ],
  },
  l14: {
    id: 'l14',
    title: 'Capstone — End-to-End Predictive Machine Learning Pipeline',
    scenario: 'You are submitting your final enterprise capstone for the Skylent Data Science & AI track. You must deliver a production-ready machine learning pipeline that validates, trains, evaluates, and exports a serialized model artifact ready for deployment.',
    objective: 'Author a complete end-to-end Python ML repository demonstrating senior-level data science hygiene and technical communication.',
    instructions: [
      'Implement modular architecture: data_loader.py, preprocessor.py, train.py, evaluate.py, and model_export.py.',
      'Include automated data validation assertions checking schema invariants.',
      'Implement threshold optimization maximizing expected business value under asymmetric cost of false positives vs false negatives.',
      'Serialize the complete pipeline (preprocessing + model) using joblib.',
      'Provide a comprehensive Markdown README documenting pipeline reproduction and performance benchmarks.',
    ],
    requiredOutput: [
      'Complete modular Python source code.',
      'Confusion matrix and threshold tuning analysis table.',
      'Model serialization and verification script.',
      'Technical defense memo summarizing methodology and limitations.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      { criterion: 'System Architecture', weight: '25%', description: 'Clean modular organization separating ingest, preprocessing, training, and export.' },
      { criterion: 'Evaluation & Threshold Tuning', weight: '35%', description: 'Thoughtful decision threshold selection aligned with business cost trade-offs.' },
      { criterion: 'Production Readiness', weight: '25%', description: 'Serialized pipeline artifact and reproducible training script.' },
      { criterion: 'Technical Documentation', weight: '15%', description: 'Exemplary README documentation and methodology defense.' },
    ],
  },
}

export function getDsAssignment(lessonId: string): AssignmentBrief | undefined {
  return DS_ASSIGNMENTS[lessonId]
}
