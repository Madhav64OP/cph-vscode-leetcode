const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { exec, spawn } = require('child_process');
const os = require("os");
const app = express();
const port = 5000;
const cors = require("cors");
const { preProcessFile } = require("typescript");
const { error } = require("console");

app.use(cors());
app.use(bodyParser.json());

const clearFiles = (dir) => {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            fs.rmSync(filePath);
        });
    }
};

//cross platform python support
const platform = os.platform();
let pythonCommand = "python";

if (platform === "win32") {
    pythonCommand = "python";
}
else if (platform === "darwin" || platform === "linux") {
    pythonCommand = "python3";
}

app.post("/api/createFiles", (req, res) => {
    const data = req.body;
    console.log("Received data:", data);

    const outputDir = path.join(__dirname, "generatedFiles");

    const inputDirectory = path.join(outputDir, "inputs");
    const outputDirectory = path.join(outputDir, "outputs");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    if (!fs.existsSync(inputDirectory)) {
        fs.mkdirSync(inputDirectory);
    }
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory);
    }

    //existing ko pehle remove krdo then new banao

    clearFiles(inputDirectory);
    clearFiles(outputDirectory);



    data.forEach((todo) => {
        const inputFilePath = path.join(inputDirectory, `input_${todo.index}_id=${todo.id}.txt`);
        const outputFilePath = path.join(outputDirectory, `output_${todo.index}_id=${todo.id}.txt`);

        console.log(`Creating files: ${inputFilePath}, ${outputFilePath}`);

        fs.writeFileSync(inputFilePath, todo.input, "utf8");
        fs.writeFileSync(outputFilePath, todo.output, "utf8");
    });

    res.status(200).send("Files created successfully.");
});

app.post("/api/runCode", (req, res) => {
    const data = req.body;
    const language = data.language;
    const codeContent = data.codeContent;
    console.log(`language is ${language},code =${codeContent}`);
    console.log(`languge type= ${typeof (language)} code type=${typeof (codeContent)}`);
    const mainDir = path.join(__dirname, 'generatedFiles');

    const allInput = fs.readdirSync(path.join(mainDir, 'inputs'));
    const allOutput = fs.readdirSync(path.join(mainDir, 'outputs'));

    const responseOutputChecker = [];
    const finalReturnResponse = [];

    //logic of temporary file making
    const tempFilesPath = path.join(__dirname, 'tempFiles');
    if (!fs.existsSync(tempFilesPath)) {
        fs.mkdirSync(tempFilesPath);
    }
    const mainPathTempFiles = path.join(__dirname, 'tempFiles');
    const codeFileNamePath = path.join(mainPathTempFiles, `tempCodefile_${Date.now()}.${language}`);

    clearFiles(tempFilesPath);
    fs.writeFileSync(codeFileNamePath, codeContent, 'utf-8');

    let compiledFile = path.join(tempFilesPath, 'compiledCode');

    if (!language) {
        return res.status(400).json({
            error: true,
            mesage: "Please Select a Language",
            type: "LANGUAGE_NOT_SELECTED"
        });
    }

    if (language !== "cpp" && language !== "py") {
        return res.status(400).json({
            error: true,
            mesage: "Invalid Lang Selected",
            type: "LANGUAGE_INVALID"
        });
    }

    if (language === 'cpp') {
        compiledFile = codeFileNamePath.replace('.cpp', '');
    }

    const processTestCases = async () => {
        let idx = 1;

        for (const file of allInput) {
            const inputData = fs.readFileSync(path.join(mainDir, 'inputs', file), 'utf-8');

            if (language === 'py') {
                await runPythonCode(idx, inputData, file);
            }
            else if (language === 'cpp') {
                await runCppCode(idx, inputData, compiledFile, file);
            }
            idx++;
        }

        // console.log(".........Code were runned successfully");

        // console.log(`....Hey ! Check this response OUt`, responseOutputChecker);

        allOutput.forEach((eachOutput) => {
            const outputText = fs.readFileSync(path.join(mainDir, 'outputs', eachOutput), 'utf-8');
            // console.log((eachOutput.match(/output_(\d+)_id=(\d+)/)[2]));
            const checingOutput = responseOutputChecker.filter((eachEle) => eachEle.id === eachOutput.match(/output_(\d+)_id=(\d+)/)[2])[0].codeOutput.trim().split(" ").join(" ");
            // console.log(`ouput check:${checingOutput}`);
            const normalizeString = (str) => str.trim().replace(/\r\n/g, '\n');
            if (outputText.trim().replace(/\r\n/g, '\n') === checingOutput.trim().replace(/\r\n/g, '\n')) {
                finalReturnResponse.push({
                    id: eachOutput.match(/output_(\d+)_id=(\d+)/)[2],
                    todoOutput: outputText.trim(),
                    codeOutput: checingOutput.trim(),
                    sucess: true
                });
            }
            else {
                finalReturnResponse.push({
                    id: eachOutput.match(/output_(\d+)_id=(\d+)/)[2],
                    todoOutput: outputText.trim(),
                    codeOutput: checingOutput.trim(),
                    sucess: false
                });
            }
        });
        res.json(finalReturnResponse);

    };

    const runPythonCode = async (testCaseIdx, inputData, fileName) => {
        return new Promise((resolve, reject) => {
            // const fileContent = fs.readFileSync(mainDir, 'inputs', file);
            const pythonProcess = spawn(pythonCommand, [codeFileNamePath]);

            pythonProcess.stdin.write(inputData);
            pythonProcess.stdin.end();

            pythonProcess.stdout.on('data', (data) => {
                const match = fileName.match(/input_(\d+)_id=(\d+)/)[2];
                responseOutputChecker.push({
                    id: match,
                    codeOutput: data.toString()
                });
                // console.log(`output for test case ${testCaseIdx} id ${data.toString()}`);
            });
            pythonProcess.stdout.on('error', (error) => {
                // console.log(`Error for test case ${testCaseIdx} id ${error}`);
            });

            pythonProcess.on('close', () => resolve());
        });
    };


    const runCppCode = (testCaseIdx, inputData, compiledFile, fileName) => {
        return new Promise((resolve, reject) => {
            const cppProcess = spawn(compiledFile);

            cppProcess.stdin.write(inputData);
            cppProcess.stdin.end();

            cppProcess.stdout.on('data', (data) => {
                const match = fileName.match(/input_(\d+)_id=(\d+)/)[2];
                responseOutputChecker.push({
                    id: match,
                    codeOutput: data.toString()
                });
                console.log(`output for test case ${testCaseIdx} : ${data.toString()}`);
            });
            cppProcess.stdout.on('error', (error) => {
                console.log(`Error for test case ${testCaseIdx} : ${error}`);
            });

            cppProcess.on('close', () => resolve());
        });
    };



    if (language === 'cpp') {
        const compileProcess = spawn('g++', [codeFileNamePath, '-o', compiledFile]);
        compileProcess.on('close', (code) => {
            if (code === 0) {
                console.log("Cpp File was compiled sucessfully");
                processTestCases();
            }
            else {
                console.error("Cpp complicaiton failed");
                res.status(500).send('Cpp complication failed');
            }
        });
    } else {
        processTestCases();
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
