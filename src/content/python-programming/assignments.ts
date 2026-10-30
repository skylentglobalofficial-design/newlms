import type { AssignmentBrief } from '../data-analytics/assignments'

const pasteNote =
  'This LMS records a text/code submission. Paste your complete, runnable Python script along with sample execution output. Ensure your code follows PEP 8 style standards.'

export const PYTHON_ASSIGNMENTS: Record<string, AssignmentBrief> = {
  l6: {
    id: 'l6',
    title: 'Log Stream Parser — Automated Metric Extractor',
    scenario:
      'You are an automation engineer at Skylent Cloud Services. A mission-critical microservice generates high-volume web access logs with occasional HTTP 5xx errors and latency spikes. The ops team needs a streaming Python CLI script that parses the log stream line-by-line, tracks request counts, status codes, and latency metrics in O(1) memory, and outputs a formatted incident summary.',
    objective:
      'Author a robust, memory-efficient Python log analyzer using generator streams, regex pattern matching, and dictionary aggregation.',
    instructions: [
      'Write a generator function stream_log_lines(file_path) that yields lines one by one without reading the whole file into RAM.',
      'Parse each line extracting timestamp, HTTP method, path, status code (integer), and latency_ms (float).',
      'Aggregate total requests, error count (status >= 500), error rate percentage, and average latency.',
      'Handle malformed lines gracefully by logging a warning and continuing without crashing.',
      'Format the final summary to stdout using clean terminal formatting with total counts and percentages.',
    ],
    requiredOutput: [
      'Complete runnable Python source code with generator function.',
      'Log parser regex pattern with named groups or safe split logic.',
      'Error handling block for malformed lines and missing files.',
      'Sample terminal output from running against at least 20 sample log lines.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      {
        criterion: 'Streaming Memory Efficiency',
        weight: '30%',
        description: 'Code processes logs lazily via generators in O(1) memory without reading the full file into memory.',
      },
      {
        criterion: 'Parsing Accuracy & Aggregations',
        weight: '30%',
        description: 'HTTP status codes and latencies are parsed correctly into numbers with accurate error rate calculations.',
      },
      {
        criterion: 'Error Resilience',
        weight: '25%',
        description: 'Malformed log entries and missing files are handled gracefully without uncaught exceptions.',
      },
      {
        criterion: 'Code Quality & PEP 8',
        weight: '15%',
        description: 'Code is clean, readable, properly type-hinted, and adheres to idiomatic Python standards.',
      },
    ],
  },
  l12: {
    id: 'l12',
    title: 'Production ETL Pipeline — File Ingestion & Transformation',
    scenario:
      'Skylent Learning Platform receives daily transaction extracts from partner colleges and workshops in mixed JSON and CSV formats. Several fields contain dirty data (missing student emails, negative fee amounts, inconsistent date stamps). You need an automated, idempotent batch ingestion pipeline that cleans, validates, and consolidates these extracts into a normalized output file.',
    objective:
      'Author a production-grade Python ETL script using pathlib, dataclasses, context managers, and argparse flags.',
    instructions: [
      'Use pathlib.Path to scan an input directory for .json and .csv transaction files.',
      'Define an immutable @dataclass(frozen=True) TransactionRecord representing validated transactions.',
      'Validate that student email contains "@", fee amount is positive, and dates conform to ISO-8601.',
      'Write clean records to an output normalized CSV file using an atomic write pattern (writing to temp file first, then renaming).',
      'Output a JSON summary report showing total records processed, valid count, rejected count, and rejection reasons.',
    ],
    requiredOutput: [
      'Complete runnable Python script with argparse CLI flags (--input-dir, --output-file).',
      'TransactionRecord dataclass schema definition with type hints.',
      'Validation rules function returning validation status and error message.',
      'Atomic file write logic ensuring partial writes do not corrupt the destination file.',
      'Sample summary JSON report generated from test data.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      {
        criterion: 'Data Model & Type Hints',
        weight: '25%',
        description: 'Schema is modeled with immutable dataclasses and clear static type annotations.',
      },
      {
        criterion: 'Validation & Invariant Enforcement',
        weight: '30%',
        description: 'Negative amounts, malformed emails, and invalid dates are rejected with explicit reasons.',
      },
      {
        criterion: 'Atomic File Handling & Pathlib',
        weight: '25%',
        description: 'Path manipulation uses pathlib.Path and file writes are safe from corruption.',
      },
      {
        criterion: 'CLI Usability & Reporting',
        weight: '20%',
        description: 'CLI interface accepts arguments cleanly and provides an audit summary report.',
      },
    ],
  },
  l14: {
    id: 'l14',
    title: 'Capstone — Production Automated CLI Utility & Service',
    scenario:
      'You are building the official Skylent System Health & Automation CLI ("skylent-agent"). This tool checks local server health, monitors disk and API response latencies, executes scheduled backups, and writes structured audit logs. The tool must be packaged with full modular architecture, custom exceptions, and a complete pytest suite verifying all edge cases.',
    objective:
      'Deliver an end-to-end, production-ready Python utility featuring CLI argument parsing, custom context managers, defensive exception handling, and a thorough pytest suite.',
    instructions: [
      'Structure the project into modules: cli.py, health.py, storage.py, exceptions.py, and test_agent.py.',
      'Define a custom exception hierarchy inheriting from a base SkylentAutomationError.',
      'Implement a context manager time_operation(label) that measures elapsed execution time and logs warnings on slow operations.',
      'Include health check probes for disk space, API endpoint reachability, and memory headroom.',
      'Author at least 5 pytest test functions in test_agent.py using fixtures (tmp_path, monkeypatch) to verify success and failure paths with zero external dependencies.',
    ],
    requiredOutput: [
      'Complete source code for all modules (or combined single-file with clearly demarcated sections).',
      'Custom exception hierarchy with descriptive error messages.',
      'Resource context manager implementation.',
      '5+ comprehensive pytest unit tests verifying normal operation and error scenarios.',
      'Documentation README showing installation, CLI usage examples, and pytest execution output.',
    ],
    submissionFormat: pasteNote,
    evaluationCriteria: [
      {
        criterion: 'Architectural Modularity & OOP',
        weight: '25%',
        description: 'Code is cleanly decoupled into single-responsibility components with clean interfaces.',
      },
      {
        criterion: 'Defensive Exception Handling',
        weight: '25%',
        description: 'Custom exceptions are used thoughtfully with context managers guaranteeing resource cleanup.',
      },
      {
        criterion: 'Automated Testing with Pytest',
        weight: '30%',
        description: 'Pytest test suite achieves strong coverage with isolated fixtures and mocks.',
      },
      {
        criterion: 'Documentation & CLI Ergonomics',
        weight: '20%',
        description: 'CLI help text, error feedback, and documentation make the tool easy to operate in production.',
      },
    ],
  },
}

export function getPythonAssignment(lessonId: string): AssignmentBrief | undefined {
  return PYTHON_ASSIGNMENTS[lessonId]
}
