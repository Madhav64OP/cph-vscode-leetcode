import { useEffect, useState } from "react"
import IndividualTest from "./IndividualTest";
import { TodoProvider } from "../context/TodoContext";
import { time } from "console";

function TestCases({ initialtestCase = { input: '', output: '' } }) {
    const [language, setLanguage] = useState("");
    const currDateId = Date.now();
    const [todos, setTodos] = useState([
        {
            id: currDateId,
            todo: initialtestCase.input,
            todoOP: initialtestCase.output,
            completed: null,
        }
    ]);

    const [todo, setTodo] = useState("");
    const [todoOP, setTodoOP] = useState([]);
    const [codeFileName, setCodeFileName] = useState("");
    const [codeFileContent, setCodeFileContent] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [fileLoaded, setFileLoaded] = useState(false);
    const [rawFile, setRawFile] = useState(null);
    // const [backendCodeResponse, setBackendCodeResponse] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");


    useEffect(() => {
        if (initialtestCase.input && initialtestCase.output) {
            updateTodo(currDateId,
                {
                    // id: Date.now(),
                    todo: initialtestCase.input,
                    todoOP: initialtestCase.output,
                    completed: false,
                }
            );
        }
    }, [initialtestCase]);


    const add = (e) => {
        e.preventDefault();

        // if (!todo) return
        addTodo({ todo, todoOP, completed: null });
        setTodo("");
        setTodoOP("");
    }

    const addTodo = (todo) => {
        setTodos((prev) => [
            ...prev,
            { id: Date.now(), ...todo },
        ]);
    };


    // 
    // const addTodo = (todo, output) => {
    //     setTodos((prev) => [
    //         ...prev,
    //         { id: Date.now(), ...todo, output },

    //     ]);
    // };

    const updateTodo = (id, todo) => {
        setTodos((prev) => prev.map((prevTodo) => (prevTodo.id === id ? todo : prevTodo)));
    }

    const deleteTodo = (id) => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }

    const toggleComplete = (id) => {
        setTodos((prev) => prev.map((prevTodo) => prevTodo.id === id ? { ...prevTodo, completed: true } : prevTodo));
    }

    const HandleLanguageClick = (e) => {
        // console.log("value of lanuge selected is ",e.target.value);
        setLanguage(e.target.value);
    }

    const handleInputFile = async (e) => {
        const file = e.target.files[0];
        setRawFile(file);
        if (!file) {
            setFileLoaded(false);
        }

        try {
            const fileReader = new FileReader();
            const readFile = new Promise((resolve, reject) => {
                fileReader.onload = () => resolve(fileReader.result);
                fileReader.onerror = () => reject(new Error('failed to read file'));
            })

            fileReader.readAsText(file);
            const content = await readFile;
            setFileLoaded(true);
            setCodeFileName(file.name);
            setCodeFileContent(content);


        } catch (error) {
            // console.error("error reading files")
            setErrorMessage("Error reading files :", error);
            setTimeout(setErrorMessage("",), 2200);
        }
        finally {
            setFileLoaded(true);
        }

        // console.log("File set wla code run hogaya")
    }


    //main backend wala part and vs code backend
    const getActiveEditorContent = async () => {
        if (!window.vscodeApi) {
            window.vscodeApi = window.acquireVsCodeApi();
        }
    
        return new Promise((resolve, reject) => {
            const messageHandler = (event) => {
                console.log("Received message:", event.data);
                if (event.data.command === "activeEditorContent") {
                    window.removeEventListener("message", messageHandler);
                    resolve({
                        content: event.data.content || "",
                        lang: event.data.lang || ""
                    });
                }
            };
    
            window.addEventListener("message", messageHandler);
    
            window.vscodeApi.postMessage({ type: "getActiveEditorContent" });
    
            const timeoutId = setTimeout(() => {
                window.removeEventListener("message", messageHandler);
                resolve({ content: "", lang: "" });
            }, 2000);
        });
    };


    const createFiles = async () => {
        setLoaded(false);
        const data = todos.map((todoEach, i) => ({
            id: String(todoEach.id),
            input: (String(todoEach.todo)),
            output: (String(todoEach.todoOP)),
            index: i + 1,
        }));
        // console.log(data)
        try {
            const response = await fetch('http://localhost:5000/api/createFiles', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                // throw new Error("Failed to create files: " + response.statusText);
                setErrorMessage("Failed to Create files :Check Your Code File");
                setTimeout(setErrorMessage("",), 2200);
            }
            // console.log("Files created successfully.");
        } catch (error) {
            setErrorMessage("Error reading files :", error);
            setTimeout(setErrorMessage("",), 2200);
            setLoaded(true);
        }
    };


    const runCode = async (editorContent, editorLang) => {
        // console.log(language);
        // console.log(codeFileContent);
        setLoaded(false);
        try {
            const data = {
                // language: String(language),
                language: String(editorLang),
                // codeContent: String(codeFileContent),
                codeContent: String(editorContent),
                fileName: String(codeFileName),
            }
            const response = await fetch('http://localhost:5000/api/runCode', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
                // mode:'no-cors'
            });
            const jsonReturned = await response.json();
            // console.log("Getting data from Backend")
            // console.log(jsonReturned);

            // setBackendCodeResponse(jsonReturned);

            setTodos((prevTodo) =>
                prevTodo.map((todo) => {
                    const matchedResponse = jsonReturned.find((res) => res.id === String(todo.id));
                    if (matchedResponse) {
                        return { ...todo, completed: matchedResponse.sucess };
                    }
                    return todo;
                })
            );

            // setTodos((prevTodos) => 
            //     prevTodos.map((todo) => {
            //         const matchedResponse = jsonReturned.find((res) => res.id === String(todo.id));
            //         if (matchedResponse) {
            //             return { ...todo, completed: matchedResponse.sucess };
            //         }
            //         return todo;
            //     })
            // );

            if (jsonReturned.error) {
                setErrorMessage("Error reading files :", jsonReturned.mesage);
                setTimeout(setErrorMessage("",), 2200);
            }

        } catch (err) {
            setErrorMessage("Error reading files :", err);
            setTimeout(setErrorMessage("",), 2200);
            setLoaded(true);
        }
    }

    const handleRunCasesButton = async () => {
        try {
            const editorData = await getActiveEditorContent();
            
            console.log("Full editor data:", editorData);
    
            if (!editorData.content) {
                setErrorMessage("No active editor content found");
                return;
            }
    
            await createFiles();
            await runCode(editorData.content, editorData.lang);
        } catch (err) {
            setErrorMessage(err.message || "Error retrieving editor content");
        }
        finally{
            setTimeout(() => {
                setErrorMessage("");
            }, 2300);
        }
    };


    return (
        <TodoProvider value={{ todos, addTodo, deleteTodo, updateTodo, toggleComplete }}>
            <div id="main-cases-container" className="bg-[#070706] text-[#070706]  flex flex-col gap-4 justify-center items-center text-center ">
                <div id='container-ip-op-add' className="flex justify-center items center flex-col gap-2   px-4 py-2 rounded-md">
                    <div id="outputs" className="flex flex-col gap-3 justify-center items-center">
                        {/* loop and all items here also */}
                        {/* <IndividualTest todo={customTodo}/> */}
                        {/* <IndividualTest todo={{ id: Date.now(), todo: "Custom Todo", todoOP: "Cutsom op", completed: false }} /> */}
                        {todos.map((todo) => (
                            <div key={todo.id}>
                                <IndividualTest todo={todo} />
                            </div>
                        ))}
                    </div>
                    <div
                        id="buttons-textcase-testcase"
                        className="flex justify-center items-center  ml-auto"
                    >
                        <div id="add-btn">
                            <button onClick={add} className="bg-[#28a745] px-[4px] py-[2px] rounded-lg font-semibold text-base hover:cursor-pointer transition-all duration-300 hover:opacity-70 flex justify-center items items-center text-center gap-2"><p className="text-2xl text-bold block">+</p><p>Add Test Cases</p></button>
                        </div>
                    </div>
                </div>



                <div id="select-language" className="flex  flex-col justify-center items-center gap-1 ">
                    {/* <h1 className="font-semibold text-[#e7a41f] text-xs">C++ or Python</h1> */}
                    {/* <h1 className="hover:cursor-pointer rounded-lg px-[8px] py-1 outline-none shadow-lg" name="Language Button" id="selector-lang" > */}
                    {/* <option value="">--Select--</option>
                        <option value="py" >python</option>
                        <option value="cpp" >C++</option> onChange={HandleLanguageClick} */}
                    {/* </h1> */}
                </div>
                {/* <div id="upload-code " className="bg-[#e7a41f] px-2 py-1 rounded-md font-semibold text-center my-3 transition-all duration-300 hover:opacity-70">
                    <div id="button-upload" className="flex flex-col justify-center items-center ">
                        <input type="file" id="file-upload" accept=".py,.cpp" placeholder="Upload Code Here" onChange={handleInputFile} style={{ display: 'none' }} />
                        <div id="label-check" className="flex justify-center items-center flex-col ">
                            <label htmlFor="file-upload" onChange={handleInputFile} className="hover:cursor-pointer"><p>Click Here to Upload
                            </p></label>
                            {fileLoaded && <p className={`text-[#28a745] bg-[#070706] px-[8px] py-[2px] text-center rounded-full`}>{codeFileName} ✔ </p>}
                        </div>
                    </div>
                </div> */}
                {/* {loaded && (
                    <div id="loader-code" className="flex justify-center items-center ">
                        <div id="main-loader" className="flex text-[#e7a41f] justify-center items-center text-lg gap-2">
                            <div id="spinner" className="w-[10px] h-[10px] animate-spin rounded-full border-t-2 border-b-2 border-r-2 border-l-2 border-[#e7a41f] " style={{ borderTopColor: "transparent" }}>
                            </div>
                            <div id="text-loader" className="flex justify-center items-center text-center text-[15px] text-[#e7a41f]"><p>Getting Results.....</p></div>
                        </div>
                    </div>
                )} */}
                {errorMessage &&
                            <p className="text-red-600 w-full">{errorMessage}</p>}
                <div id="run-cases" className="mb-4">
                    <div id="get-results" className="border-2xl border-[#070706]">
                        <button onClick={handleRunCasesButton} className="text-white outline-none transition-all duration-300 hover:opacity-70 bg-[#007bff] text-lg font-semibold border-2 rounded-lg px-2 py-1 border-[#fff] mb-4">
                            Run Cases
                        </button>
                        
                    </div>
                </div>
            </div>
        </TodoProvider >
    )
}

export default TestCases