import { useEffect, useRef, useState } from "react";
import TestCases from "./TestCases";


function MainPage() {
  const [inputVal, setInputVal] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [quesName, setQuesName] = useState("")
  const [quesId, setquesId] = useState("")
  const [testCasesOutput, settestCasesOutput] = useState([]);

  const [firstIndividual, setFirstIndividual] = useState({
    input:" ",
    output:" "
  });
  // const [testCasesForTxtFile, setTestCasesForTxtFile] = useState("");

  const handleInputChange = (e) => {
    setInputVal(e.target.value);
  }
  const textareaRef = useRef(null);
  const textareaRefOP = useRef(null);


  useEffect(() => {
    autoResize(textareaRef);
    autoResize(textareaRefOP);
  }, [testCases]);

  const autoResize = (ref) => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };



  const handleExampleCaseChange = (e) => {
    setTestCases(e.target.value);
  }


  const getProbDetails = async (Link) => {
    setLoading(true);
    setLoaded(false);
    try {
      const url = new URL(Link);
      const elem = url.pathname.split("/");
      const ques = elem[2];
      setErrorMessage("");
      const response = await fetch(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${ques}`)

      if (response.status == 429) {
        setErrorMessage('Some issue is from our end , please try again later');
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
        return;
      }

      const jsonFile = await response.json();

      if (Object.keys(jsonFile).length === 0) {
        setErrorMessage("Your URL was Incorrect");
        setTimeout(() => { setErrorMessage("") }, 2000)
        setTimeout(() => { setInputVal("") }, 2300)
      }
      else {
        const testCases = jsonFile.exampleTestcases.split("\n").map((testCase) => testCase.trim());
        const testCasePattern =
          /<strong>Input:<\/strong>\s*(.*?)\n.*?<strong>Output:<\/strong>\s*(.*?)\n/gs;
          
        const matches=[...jsonFile.question.matchAll(testCasePattern)];

        const testCasesOutput=matches.map((match)=>match[2].trim());

        const resultInput=jsonFile.exampleTestcases.replace(/\"/g,"").split('\n').filter(Boolean).join('\n');
        const resultOutput=matches.map((match)=>match[2].trim()).join('\n');

        setFirstIndividual({
          input:resultInput,
          output:resultOutput
        });
        
        settestCasesOutput(testCasesOutput.join('\n'));

        setTestCases(testCases.join("\n"));
        setQuesName(jsonFile.questionTitle);
        setquesId(jsonFile.questionId);
      }
    }
    catch (e) {
      setErrorMessage("Enter a valid URL")
      setTimeout(() => (setErrorMessage("")), 2000);
      setTimeout(() => (setInputVal("")), 2300);
      console.log(e);
    }
    finally {
      setLoading(false);
      setLoaded(true);
    }
  }

  const handleButtonClick = () => {
    getProbDetails(inputVal);
  }

  useEffect(() => {
    setFirstIndividual(firstIndividual);
  }, [firstIndividual])
  

  return (
    <>
      <div
        className="flex gap-6 flex-col justify-center items-center text-[#070706] p-7 border-b-2 bg-[#070706]"
        id="main-body-extension"
      >
        <div id="heading" className="text-2xl font-bold text-[#e7a41f]">
          <h1>Welcome to the CPH-Leetcode Extensiton</h1>
        </div>
        <div
          id="input-url"
          className="flex flex-col gap-5 justify-center items-center text-center"
        >
          <div id="title" className="text-lg text-white">
            Please Enter Your LeetCode Problem URL Below
          </div>
          {!loading &&
            <div id="ip-box" className="">
              <input
                type="text"
                value={inputVal}
                onChange={handleInputChange}
                placeholder="Enter URL here"
                className="px-3 py-2 rounded-3xl  border-[2px]  border-[#070706] outline-none"
              />
            </div>}
          {loading && (
            <div id="loader" className="flex justify-center items-center ">
              <div id="main-loader" className="flex text-[#e7a41f] justify-center items-center text-lg gap-2">
                <div id="spinner" className="w-[10px] h-[10px] animate-spin rounded-full border-t-2 border-b-2 border-r-2 border-l-2 border-[#e7a41f] " style={{ borderTopColor: "transparent" }}>
                </div>
                <div id="text-loader" className="flex justify-center items-center text-center text-[15px] text-[#e7a41f]"><p>Getting Results.....</p></div>
              </div>
            </div>
          )}
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        </div>
        <div id="get-results" className="border-2xl border-[#070706]">
          <button onClick={handleButtonClick} className="text-[#e7a41f] transition-all duration-300 hover:opacity-70 bg-[#070706] text-lg font-semibold border-2 rounded-2xl px-4 py-2 border-[#fff]">
            Get Results
          </button>
        </div>
      </div>
      {loaded && firstIndividual.input && (
        <>
          <div id="ques-title" className="text-[#e7a41f] text-xl p-2 mt-3 text-center flex justify-center items-center"><h1>{quesId}. {quesName}</h1></div>
          <div id="cases" className="bg-[#070706] ">
            <div id='ip-op-testcase-container' className="flex justify-center items-center flex-col mb-3">
              <h1 className="text-[#e7a41f] font-semibold mt-3 text-lg">Problem Cases</h1>
              <div id="example-case-ip" className="p-4 outline-none flex flex-col justify-center items-center text-center ">
                <h2 className="text-white text-lg font-semibold my-2">Inputs</h2>
                <textarea
                  ref={textareaRef}
                  value={testCases}
                  className="rounded-lg p-[6px] text-[#070706] outline-none font-semibold resize-none"
                  onChange={() => {
                    handleExampleCaseChange;
                    autoResize;
                  }}
                  style={{ overflowY: 'hidden' }}
                  onInput={autoResize}
                  readOnly
                />
              </div>
              <div id="example-case-op" className="p-4 outline-none flex flex-col justify-center items-center text-center ">
                <div><h2 className="text-white text-lg font-semibold my-2">Outputs</h2></div>
                <textarea
                  ref={textareaRefOP}
                  value={testCasesOutput}
                  className="rounded-lg p-[6px] text-[#070706] outline-none font-semibold resize-none"
                  onChange={() => {
                    handleExampleCaseChange;
                    autoResize;
                  }}
                  style={{ overflowY: 'hidden' }}
                  onInput={autoResize}
                  readOnly
                />
              </div>
            </div>
            <TestCases initialTestCase={firstIndividual} />
          </div>
        </>
      )
      }
    </>
  );
}

export default MainPage;
