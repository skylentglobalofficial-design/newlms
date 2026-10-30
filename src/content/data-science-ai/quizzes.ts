export type DsQuizQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  lessonId: string
  moduleId: string
}

export type DsQuizBank = {
  lessonId: string
  title: string
  questions: DsQuizQuestion[]
}

export const DS_QUIZZES: Record<string, DsQuizBank> = {
  l3: {
    lessonId: 'l3',
    title: 'Leakage & Validation Check',
    questions: [
      {
        id: 'ds-l3-q1',
        prompt: 'Why is fitting a StandardScaler on the entire dataset BEFORE splitting into train and test sets considered data leakage?',
        options: [
          'It causes the scaler to run out of memory',
          'The test set statistics (mean and variance) leak into the training process, producing artificially optimistic test performance',
          'StandardScaler only works on training sets and fails on test sets',
          'It invalidates categorical encoding',
        ],
        correctIndex: 1,
        explanation: 'Fitting on the full dataset exposes the mean and standard deviation of the test set to the training phase, violating the fundamental assumption that the test set is unseen future data.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'ds-l3-q2',
        prompt: 'In time-series forecasting (e.g. daily sales), which validation split strategy must be used to avoid temporal leakage?',
        options: [
          'Random k-fold cross-validation',
          'Stratified k-fold cross-validation',
          'Time-based forward chaining (rolling-origin or TimeSeriesSplit)',
          'Leave-one-out cross-validation',
        ],
        correctIndex: 2,
        explanation: 'Random shuffling leaks future observations into past training sets. In time-series problems, training data must strictly precede testing data chronologically.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'ds-l3-q3',
        prompt: 'What constitutes target leakage in a loan default prediction model?',
        options: [
          'Including the applicant’s age and credit score',
          'Including "debt_collection_agent_assigned" — a feature that only exists AFTER the borrower has already defaulted',
          'Normalizing the loan amount feature',
          'Imputing missing income values with the median',
        ],
        correctIndex: 1,
        explanation: 'Target leakage occurs when a feature contains information that will not be available at the actual moment the model makes an inference in production.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'ds-l3-q4',
        prompt: 'When is StratifiedKFold preferred over standard KFold cross-validation?',
        options: [
          'When the target variable is continuous numeric',
          'When working with classification tasks, especially with imbalanced class distributions',
          'When the dataset has fewer than 10 rows',
          'When features are highly correlated',
        ],
        correctIndex: 1,
        explanation: 'StratifiedKFold ensures that each fold maintains the same percentage of samples for each class as the complete dataset, critical for imbalanced classes.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'ds-l3-q5',
        prompt: 'What is the main danger of tuning hyperparameters directly against the test set?',
        options: [
          'The training process takes longer',
          'The test set is no longer an unbiased estimate of generalization error because the model hyperparameters overfit to the test set',
          'The model coefficients become zero',
          'The dataset gets corrupted',
        ],
        correctIndex: 1,
        explanation: 'Hyperparameters must be tuned using a validation set or cross-validation on the training set. The test set must be evaluated only once as the final unbiased check.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
    ],
  },
  l9: {
    lessonId: 'l9',
    title: 'Supervised Learning Check',
    questions: [
      {
        id: 'ds-l9-q1',
        prompt: 'What is the key geometric and functional difference between L1 (Lasso) and L2 (Ridge) regularization?',
        options: [
          'L1 drives coefficients exactly to zero (performing feature selection), whereas L2 shrinks coefficients close to zero without setting them to zero',
          'L2 drives coefficients to zero while L1 leaves them untouched',
          'L1 applies only to classification; L2 applies only to regression',
          'L1 increases the variance of the model',
        ],
        correctIndex: 0,
        explanation: 'Due to the diamond geometry of the L1 penalty, it drives non-informative feature weights strictly to zero, effectively acting as an automated feature selector.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'ds-l9-q2',
        prompt: 'Why does logistic regression use the sigmoid activation function on top of a linear equation?',
        options: [
          'To increase the speed of matrix multiplication',
          'To map real-valued linear outputs (-infinity to +infinity) into a valid probability range between 0 and 1',
          'To prevent underfitting on decision trees',
          'To calculate Euclidean distance',
        ],
        correctIndex: 1,
        explanation: 'The sigmoid function (1 / (1 + e^-z)) compresses any linear real number into [0, 1], representing the estimated probability P(Y=1|X).',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'ds-l9-q3',
        prompt: 'What is cross-entropy loss measuring in binary classification?',
        options: [
          'The straight-line distance between predictions and actual labels',
          'The divergence/penalty between the predicted probability distribution and the actual true binary outcome',
          'The number of trees in an ensemble',
          'The variance of the training set features',
        ],
        correctIndex: 1,
        explanation: 'Binary cross-entropy penalizes confident wrong predictions exponentially, driving gradient updates to align predicted probabilities with actual outcomes.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
      {
        id: 'ds-l9-q4',
        prompt: 'What symptom indicates that your learning rate is too large during gradient descent?',
        options: [
          'Loss steadily decreases to zero',
          'Loss oscillates wildly, increases, or evaluates to NaN (divergence)',
          'Training converges in exactly one iteration',
          'Feature coefficients become negative',
        ],
        correctIndex: 1,
        explanation: 'An excessively large learning rate causes updates to overshoot the minimum, leading to oscillating or diverging loss.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
      {
        id: 'ds-l9-q5',
        prompt: 'Why is feature scaling mandatory before training a regularized linear model (Ridge or Lasso)?',
        options: [
          'Regularization is scale-sensitive; features with large raw values would be penalized unfairly compared to small-scale features',
          'Linear models cannot run on floats without scaling',
          'Scaling converts categorical variables to numbers',
          'Scaling reduces the dataset row count',
        ],
        correctIndex: 0,
        explanation: 'Penalties sum the squares or absolute values of coefficients. If one feature is measured in centimeters and another in kilometers, unscaled penalties distort learning.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
    ],
  },
  l15: {
    lessonId: 'l15',
    title: 'Data Science Final Check',
    questions: [
      {
        id: 'ds-l15-q1',
        prompt: 'In a severely imbalanced fraud detection problem (99.9% non-fraud, 0.1% fraud), why is ROC-AUC often misleading compared to Precision-Recall AUC?',
        options: [
          'ROC-AUC cannot be calculated on imbalanced datasets',
          'The False Positive Rate (FPR) denominator includes the huge majority class, making the FPR tiny even with many false alarms',
          'PR-AUC only works on regression models',
          'ROC-AUC ignores true positives',
        ],
        correctIndex: 1,
        explanation: 'Because the majority negative class is enormous, a large number of false positives still yields a very small False Positive Rate, masking poor performance.',
        lessonId: 'l13',
        moduleId: 'm5',
      },
      {
        id: 'ds-l15-q2',
        prompt: 'How does Gradient Boosting differ fundamentally from Random Forest?',
        options: [
          'Random Forest builds trees sequentially to fix errors; Gradient Boosting builds trees independently in parallel',
          'Random Forest builds deep independent trees in parallel and averages them (bagging); Gradient Boosting builds shallow trees sequentially, each learning from the residuals of previous trees',
          'Gradient Boosting only works with text data',
          'Random Forest requires neural network layers',
        ],
        correctIndex: 1,
        explanation: 'Random Forest reduces variance through bagging independent trees. Gradient Boosting reduces bias sequentially by fitting each tree to the negative gradient (residuals) of the ensemble.',
        lessonId: 'l11',
        moduleId: 'm4',
      },
      {
        id: 'ds-l15-q3',
        prompt: 'What is the purpose of out-of-bag (OOB) error estimation in Random Forests?',
        options: [
          'To clean missing values from training features',
          'To estimate generalization performance using the ~36.8% of samples left out of each bootstrap sample without needing a separate validation set',
          'To speed up CPU execution by 50%',
          'To detect multicollinearity among features',
        ],
        correctIndex: 1,
        explanation: 'Each bootstrap draw leaves out roughly one-third of the samples. Evaluating trees on their unused samples provides a built-in cross-validation estimate.',
        lessonId: 'l11',
        moduleId: 'm4',
      },
      {
        id: 'ds-l15-q4',
        prompt: 'What does adjusting the classification decision threshold from 0.5 to 0.2 in a medical diagnosis model achieve?',
        options: [
          'Increases Recall (identifying more true positive sick patients) at the cost of lower Precision (more false positive alerts)',
          'Increases Precision at the cost of lower Recall',
          'Leaves the predictions completely unchanged',
          'Doubles the training time of the model',
        ],
        correctIndex: 0,
        explanation: 'Lowering the decision threshold flags more instances as positive. This catches more true cases (higher recall) while accepting more false alarms (lower precision).',
        lessonId: 'l13',
        moduleId: 'm5',
      },
      {
        id: 'ds-l15-q5',
        prompt: 'In production ML systems, what is "concept drift"?',
        options: [
          'When code comments do not match the codebase',
          'When the statistical relationship between input features X and target Y changes over time in the real world, causing model degradation',
          'When the server runs out of disk storage',
          'When a developer switches from PyTorch to TensorFlow',
        ],
        correctIndex: 1,
        explanation: 'Concept drift occurs when real-world conditions evolve (e.g. consumer behavior shifting after a pandemic), rendering historical patterns less predictive.',
        lessonId: 'l14',
        moduleId: 'm5',
      },
    ],
  },
}

export function getDsQuiz(lessonId: string): DsQuizBank | undefined {
  return DS_QUIZZES[lessonId]
}
