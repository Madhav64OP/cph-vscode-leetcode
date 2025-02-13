# CPH_LEETCODE VS Code Extension

## Overview

The **CPH_LEETCODE** VS Code extension integrates the LeetCode platform directly into VS Code, enabling you to run and test your LeetCode solutions against custom test cases directly from your editor. This extension allows you to fetch test cases, add your own inputs/outputs, and test your code without leaving the VS Code environment.

The extension provides a seamless workflow between the VSCode Editor, backend (Node.js with Express), and frontend (ReactJS) and extensiton maded in TypeScript maded with the Yo Code Generator. Test cases are managed in a TODO format and allows the user to test on his on cases of his choiuce as well as the cases on recieved form the Alfa API Response, which is then sent to the backend to create input/output files and execute the code automatically in the selected language (Python or C++) and which recievs the code contntent automatically from the onDidRecieveMessage functionality in vs code with the help of a custom command getActiveEditorContent....which send the cutrrent text window and language of the code written in the current test window and then based on thatit send it to backend via frontend and then backend sends back response which is the displaed accoringly in the ui frontend.

## Features

- **Sidebar Integration**: A custom sidebar that is registerd in extension.ts within VS Code where you can manage and test your LeetCode test cases and with your own test cases.
- **Dynamic Test Case Management**: Add custom test cases in the TODO format, automatically creating input/output files and also run edit them just by clicking on them and tpying straight.
- **Automatic Code Execution**: Automatically detects the language and code content form the active winow where user write the code and  runs the code against the test cases for Python and C++ without manual language selection all the process is automated with the help of onDidrecienveMessage Functionly in the webview
- **Backend Integration**: Node.js and Express API to handle test case file creation and execution and returning json along with error handling for bad inputs/no inputsand other misscelenaous fixes.
- **Real-time Status Updates**: Visual feedback in the VS Code sidebar based on whether the code execution is successful or not (Green for Success, Red for Failure) which updared in the state which in turn ius mangedd by the contextual api conept of react to manage the sate accorss the diffent components.

## Workflow

### 1. **Frontend (ReactJS)**:
   - **MainPage**: Displays the main interface, including the list of test cases, a TODO list, and buttons to run code.
   - **TestCase Component**: Handles individual test case execution, displaying inputs and outputs for each test.
   - **Input/Output Handling**: Each test case contains input and output sections formatted in TODO type. The frontend sends these inputs/outputs to the backend for file creation and code execution.

### 2. **Backend (Node.js & Express)**:
   - **File Creation**: The backend creates a folder named `generatedFiles` containing `input` and `output` folders. Inside each folder, files like `input_1_id="....".txt` are created for each test case. The backend ensures that the directories are automatically recreated when deleted.
   - **Code Execution**: When the user runs the test, the backend creates temporary code files (e.g., `tempCodefile_id="".cpp` or `tempCodefile_id="".py`) in the `tempFiles` directory. The code is compiled (using `g++` for C++ and `python` for Python) and executed against the test cases.
   - **Output Comparison**: The backend compares the generated output with the expected output from the test case and returns the success or failure status.

### 3. **Test Case Execution**:
   - The active code in the VS Code editor is fetched using the VS Code API.
   - The frontend sends the active code content along with its language (detected automatically from the file type) to the backend for execution.
   - The backend runs the code against each test case and compares the outputs. If the outputs match, the test case is marked as "Success" (Green); otherwise, it is marked as "Failure" (Red).

### 4. **UI Updates**:
   - Based on the API response, the frontend updates the UI with success or failure messages and highlights the respective test case in green (for success) or red (for failure).

## Installation

### Prerequisites

1. **Node.js** and **npm** installed on your system.
2. **VS Code** installed with the ability to run extensions.
4. **Compiler and languages** g++ compiler and python.
3. **ReactJS** and other frontend dependencies should be built and ready to use in the `build/` folder of your project.

### 1. Clone the Repository

```bash
git clone https://github.com/Madhav64OP/cph-vscode-leetcode.git
cd cph-vscode-leetcode 
npm run install:all
```
### 2. Open Another Terminal
```bash
cd backend
npm run start
```
and then open go in extension.ts in src folder and press f5/ then selct vs code extension development to test or other command to open the the debug window which starts the extesnion in other vs code window with our sidebar there for use.
### 3. Enjoy the Extension
Now you can run, test and enjoy working with the extension. :)
