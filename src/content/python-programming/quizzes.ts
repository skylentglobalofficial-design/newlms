export type PythonQuizQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  lessonId: string
  moduleId: string
}

export type PythonQuizBank = {
  lessonId: string
  title: string
  questions: PythonQuizQuestion[]
}

export const PYTHON_QUIZZES: Record<string, PythonQuizBank> = {
  l3: {
    lessonId: 'l3',
    title: 'Core Types & Syntax Mastery',
    questions: [
      {
        id: 'py-l3-q1',
        prompt: 'Why does Python raise a TypeError when executing 1 + "2", rather than evaluating to 3 or "12"?',
        options: [
          'Python is statically typed and catches this during syntax compilation',
          'Python is strongly typed and refuses implicit type coercion between numeric and string types',
          'Python lacks an addition operator for strings',
          'Python requires all variables to be explicitly declared before evaluation',
        ],
        correctIndex: 1,
        explanation:
          'Python is dynamically typed (types are bound to values, not names) but strongly typed: it does not perform implicit type coercion across mismatched types like JavaScript or Bash.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
      {
        id: 'py-l3-q2',
        prompt: 'What happens when a mutable object (like a list: def add_item(x, items=[])) is used as a default argument?',
        options: [
          'A new empty list is created every time the function is called',
          'Python raises a SyntaxError at function definition time',
          'The default list is created once at function definition time and shared across subsequent invocations that omit the argument',
          'The list becomes read-only and immutable inside the function scope',
        ],
        correctIndex: 2,
        explanation:
          'Default parameter expressions are evaluated once when the function is defined. If the object is mutable, modifications persist across subsequent calls. The idiomatic pattern is items=None and initializing inside.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'py-l3-q3',
        prompt: 'What is the fundamental difference between "a is b" and "a == b" in Python?',
        options: [
          '"is" compares object memory identity (id), while "==" compares value equality',
          '"is" compares string values, while "==" compares numerical values',
          '"==" checks memory address, while "is" calls the __eq__ method',
          'There is no difference; they are aliases for the same operator',
        ],
        correctIndex: 0,
        explanation:
          '"is" checks whether both variables reference the exact same object in memory (id(a) == id(b)). "==" checks if their contents are equal by calling __eq__.',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'py-l3-q4',
        prompt: 'In Python LEGB scope resolution, in what order does the interpreter search for a variable name?',
        options: [
          'Local -> Enclosing -> Global -> Built-in',
          'Global -> Local -> Enclosing -> Built-in',
          'Built-in -> Global -> Enclosing -> Local',
          'Local -> Global -> Enclosing -> Built-in',
        ],
        correctIndex: 0,
        explanation:
          'LEGB stands for Local, Enclosing (nested functions), Global (module level), and Built-in (standard built-ins like len, range).',
        lessonId: 'l2',
        moduleId: 'm1',
      },
      {
        id: 'py-l3-q5',
        prompt: 'Which of the following data types is immutable in Python?',
        options: [
          'list',
          'tuple',
          'dict',
          'set',
        ],
        correctIndex: 1,
        explanation:
          'Tuples (along with int, float, str, bytes, and frozenset) are immutable once created. Lists, dictionaries, and sets are mutable.',
        lessonId: 'l1',
        moduleId: 'm1',
      },
    ],
  },
  l9: {
    lessonId: 'l9',
    title: 'Architecture & Object Model Check',
    questions: [
      {
        id: 'py-l9-q1',
        prompt: 'What is the primary purpose of defining __repr__ in a Python class?',
        options: [
          'To convert the object into an integer hash value',
          'To provide an unambiguous, developer-focused string representation (often valid Python code to recreate the object)',
          'To serialize the object directly into JSON bytes',
          'To prevent the object from being garbage-collected',
        ],
        correctIndex: 1,
        explanation:
          '__repr__ should be unambiguous and helpful for debugging, ideally showing how to reconstruct the object. __str__ is intended for user-facing readability.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'py-l9-q2',
        prompt: 'When using @dataclass(frozen=True), what happens if you attempt to assign a new value to an attribute on an instance?',
        options: [
          'The attribute is silently ignored without error',
          'Python raises FrozenInstanceError (a subclass of AttributeError)',
          'The entire object is converted to a dictionary',
          'The assignment succeeds but issues a runtime warning',
        ],
        correctIndex: 1,
        explanation:
          'frozen=True makes the dataclass instances emulate immutable objects by generating __setattr__ and __delattr__ methods that raise FrozenInstanceError.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
      {
        id: 'py-l9-q3',
        prompt: 'How does structural subtyping via typing.Protocol differ from traditional inheritance (abc.ABC)?',
        options: [
          'Protocol requires subclasses to explicitly inherit from the Protocol class',
          'Protocol checks type compatibility based on attribute/method presence at static analysis time without explicit subclassing',
          'Protocol only works with numeric types',
          'Protocol is deprecated in Python 3.10+',
        ],
        correctIndex: 1,
        explanation:
          'typing.Protocol implements "duck typing" statically. Any class that implements the required methods and attributes satisfies the Protocol without explicit inheritance.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
      {
        id: 'py-l9-q4',
        prompt: 'Why should a mutable default in a dataclass be declared with field(default_factory=list) rather than field(default=[])?',
        options: [
          'default=[] raises ValueError immediately because Python forbids shared mutable defaults in dataclasses',
          'default_factory generates faster C-level bytecode',
          'default=[] only works with primitive integers',
          'default_factory makes the list read-only',
        ],
        correctIndex: 0,
        explanation:
          'The dataclass decorator inspects defaults and explicitly raises ValueError if a mutable default (like a list or dict) is passed directly, requiring default_factory.',
        lessonId: 'l8',
        moduleId: 'm3',
      },
      {
        id: 'py-l9-q5',
        prompt: 'If you override __eq__ in a class, what must you also do if you want instances to be usable as dictionary keys or set elements?',
        options: [
          'Implement __hash__ consistently with __eq__ (or keep the class immutable)',
          'Inherit from collections.UserDict',
          'Define __len__ returning a non-zero integer',
          'Add a sort_key attribute to the class',
        ],
        correctIndex: 0,
        explanation:
          'If a class defines __eq__ without defining __hash__, Python automatically sets __hash__ = None, making instances unhashable. If instances are immutable and value-comparable, __hash__ must be defined.',
        lessonId: 'l7',
        moduleId: 'm3',
      },
    ],
  },
  l15: {
    lessonId: 'l15',
    title: 'Production Python Final Check',
    questions: [
      {
        id: 'py-l15-q1',
        prompt: 'Why is "raise CustomError(...) from original_error" preferred over bare "raise CustomError(...)" when handling exceptions?',
        options: [
          'It preserves the complete traceback and original cause in the __cause__ attribute for debugging',
          'It catches all system exit signals automatically',
          'It converts the exception into a logging warning',
          'It prevents pytest from capturing the failure',
        ],
        correctIndex: 0,
        explanation:
          'Explicit exception chaining using "from e" populates the __cause__ attribute, providing unambiguous context to operators without masking where the root failure occurred.',
        lessonId: 'l13',
        moduleId: 'm5',
      },
      {
        id: 'py-l15-q2',
        prompt: 'What guarantee does a "with" statement (context manager) provide regarding resource management?',
        options: [
          'It guarantees __exit__ is called even if an unhandled exception is raised inside the block',
          'It runs the block in a separate multi-threaded process',
          'It automatically retries the code block up to 3 times on network failure',
          'It compiles the block into optimized assembly code',
        ],
        correctIndex: 0,
        explanation:
          'Context managers ensure reliable cleanup (closing files, releasing locks, terminating connections) because the __exit__ method is guaranteed to run, analogous to try/finally.',
        lessonId: 'l13',
        moduleId: 'm5',
      },
      {
        id: 'py-l15-q3',
        prompt: 'In a generator function yielding records, what happens to memory usage when processing a 50GB file?',
        options: [
          'Memory grows proportionally to the file size (50GB RAM required)',
          'Memory remains bounded and constant (O(1)) because records are yielded lazily one at a time',
          'Python automatically swaps the file into a temporary SQLite database',
          'Memory crashes immediately with MemoryError upon calling the generator function',
        ],
        correctIndex: 1,
        explanation:
          'Calling a generator function returns a generator iterator immediately without executing the body. Items are generated lazily on demand during iteration, keeping memory usage constant.',
        lessonId: 'l5',
        moduleId: 'm2',
      },
      {
        id: 'py-l15-q4',
        prompt: 'Why should automated automation scripts use sys.exit(0) on success and non-zero (e.g. sys.exit(1)) on failure?',
        options: [
          'Operating system and CI/CD runners inspect the process exit code to determine if the pipeline succeeded or failed',
          'Exit codes are required by Python to clear the garbage collector',
          'Zero exit code sends an email to the administrator',
          'Non-zero exit codes format the terminal output in red text',
        ],
        correctIndex: 0,
        explanation:
          'Standard POSIX convention: exit code 0 indicates clean success; any non-zero exit code indicates an error condition that automated workflow engines (GitHub Actions, Docker, Kubernetes) detect.',
        lessonId: 'l11',
        moduleId: 'm4',
      },
      {
        id: 'py-l15-q5',
        prompt: 'When writing unit tests with pytest, what is the best practice for isolating tests from filesystem and network side effects?',
        options: [
          'Run tests directly against production databases',
          'Use pytest fixtures such as tmp_path for filesystem work and unittest.mock / monkeypatch for external services',
          'Disable error reporting in the pytest configuration',
          'Hardcode sleep(5) delays between tests',
        ],
        correctIndex: 1,
        explanation:
          'pytest provides built-in fixtures like tmp_path (providing isolated temporary directory paths per test) and mocking facilities to ensure tests are fast, deterministic, and isolated from external state.',
        lessonId: 'l14',
        moduleId: 'm5',
      },
    ],
  },
}

export function getPythonQuiz(lessonId: string): PythonQuizBank | undefined {
  return PYTHON_QUIZZES[lessonId]
}
