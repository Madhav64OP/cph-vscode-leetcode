import { useEffect, useRef, useState } from "react";
import { useTodo } from "../context/TodoContext";

function IndividualTest({ todo }) {
  // const [isTodoEditable, setIsTodoEditable] = useState(false);

  const [todoMsg, setTodoMsg] = useState(todo.todo);
  const [todoMsgOutput, setTodoMsgOutput] = useState(todo.todoOP);
  const [todoCompleted, setTodoCompleted] = useState(todo.completed);

  const { updateTodo, deleteTodo, toggleComplete } = useTodo();


  const textareaRef = useRef(null);
  const textareaRefOutput = useRef(null);

  const maxLines = 7;

  useEffect(() => {
    setTodoMsg(todo.todo);
    setTodoMsgOutput(todo.todoOP);
    setTodoCompleted(todo.completed);
  }, [todo]);


  const adjustTextAreaHeight = (ref) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      const contentHeight = ref.current.style.height = `${ref.current.scrollHeight}px`;

      if (contentHeight > maxLines * 24) {
        ref.current.style.height = `${maxLines * 24}`;
        ref.current.style.overflowY = `auto`;
      }
      else {
        ref.current.style.height = contentHeight;
        ref.current.style.overflowY = 'hidden';
      }

    }
  }

  useEffect(() => {
    adjustTextAreaHeight(textareaRef);
    adjustTextAreaHeight(textareaRefOutput)
  }, [todoMsg, todoMsgOutput]);

  const editTodo = () => {
    updateTodo(todo.id, { ...todo, todo: todoMsg, todoOP: todoMsgOutput });
  };


  const toggleCompletedDone = (todo) => {
    toggleComplete(todo.id);
  }

  // const saveChanges()


  const handleInputChange = (e) => {
    setTodoMsg(e.target.value);
    updateTodo(todo.id, { ...todo, todo: e.target.value });
  };

  const handleOutputChange = (e) => {
    setTodoMsgOutput(e.target.value);
    updateTodo(todo.id, { ...todo, todoOP: e.target.value });
  };

  useEffect(() => {
    if(todo.completed!==null){

      toggleCompletedDone(todo.completed);
    }
  }, [todo.completed]);


  return (
    <div
      id="individual-case"
      className={`flex justify-between flex-col items-center  ${todoCompleted===null?" border-[#5a5a55] ":!todoCompleted ? 'border-[#dc3535]' : 'border-[#d8dbd9]'}  border-[4px] rounded-lg `}
    >
      <div id="case-area" className=" outline-none  rounded-lg px-4 py-6 gap-4 flex justify-center items-center flex-col">
        <h5 className="text-[#c1c1ba] font-bold self-start my-[-6px] text-sm">Inputs</h5>
        <textarea
          // type="text"
          ref={textareaRef}
          placeholder="Inputs Here"
          className="bg-[#5a5a55] border-[#070706] border-[3px]  rounded-lg placeholder:text-white text-white placeholder:opacity-60 outline-none  px-2 py-1 w-fit sm:w-fit resize-none overflow-hidden"
          onChange={handleInputChange}
          value={todoMsg}
          rows={2}
        />
        <h5 className="text-[#c1c1ba] font-bold self-start my-[-6px] text-sm">Outputs</h5>
        <textarea
          // type="text"
          ref={textareaRefOutput}
          placeholder="Outputs here"
          className="bg-[#5a5a55] border-[#070706] border-[3px] rounded-lg placeholder:text-white text-white placeholder:opacity-60 outline-none  px-2 py-1 w-fit sm:w-fit resize-none overflow-hidden"
          onChange={handleOutputChange}
          value={todoMsgOutput}
          rows={2}
        />
      </div>
      <div
        id="buttons-textcase"
        className="flex justify-between items-center ml-auto w-full pl-2"
      >
        <div>
        <p className={`${todoCompleted===null  ? "text-[#5a5a55] ": todoCompleted===true ?"text-[#28a745] text-left":"text-[#dc3535]"} mb-3 font-bold `}>{todoCompleted==null?"":todoCompleted ? "Success":"Failed"}</p></div>

        <div
          id="del-btn"
          className="transition-all border-[#fff] border-[2px] duration-300 hover:opacity-70 hover:cursor-pointer shadow-lg px-[6px] py-1 rounded-md bg-[#dc3535] flex start-1 m-2"
          onClick={() => deleteTodo(todo.id)}
        >
          {/* <i className="fa-solid fa-trash text-white"></i> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="#ffffff"
          >
            <path d="M3 6h18v2H3V6zm2 3h14v11c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V9zm3 2v7h2v-7H8zm4 0v7h2v-7h-2zm4 0v7h2v-7h-2zm1-7h-8l-1-1H6V2h12v1h-3l-1 1z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default IndividualTest;
