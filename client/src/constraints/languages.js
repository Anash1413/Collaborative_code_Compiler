export const SUPPORTED_LANGUAGES = [
  {
    id: 63, // Judge0 Language ID
    name: 'JavaScript (Node.js 12.14.0)',
    monacoLang: 'javascript',
    defaultCode: `// Write JavaScript here\nconsole.log("Hello from Judge0!");`,
  },
  {
    id: 71,
    name: 'Python (3.8.1)',
    monacoLang: 'python',
    defaultCode: `# Write Python here\nprint("Hello from Python!")`,
  },
  {
    id: 54,
    name: 'C++ (GCC 9.2.0)',
    monacoLang: 'cpp',
    defaultCode: `#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}`,
  },
  {
    id: 62,
    name: 'Java (OpenJDK 13.0.1)',
    monacoLang: 'java',
    defaultCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}`,
  },
];