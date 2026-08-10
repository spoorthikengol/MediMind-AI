import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

import { api } from "@/lib/api";
import { suggestedQuestions } from "@/lib/mock-data";


export const Route = createFileRoute("/app/assistant")({
  component: AssistantPage,
});


type Msg = {
  role: "user" | "assistant";
  content: string;
};


/**
 * Renders a chat message with **bold** markdown converted to real bold text,
 * and numbered ("1. ", "2. ") or bulleted ("- ") list items that run together
 * inline (no real line break in the source text) broken onto their own line.
 */
const renderMessageContent = (text: string) => {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/(\S)\s(\d+\.\s)/g, "$1\n$2")
    .replace(/(\S)\s(-\s)/g, "$1\n$2");

  const lines = normalized.split("\n");

  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
};



function AssistantPage() {


  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm MediMind AI Assistant. Ask me anything about your medical report.",
    },
  ]);


  const [input, setInput] = useState("");

  const [typing, setTyping] = useState(false);


  const endRef = useRef<HTMLDivElement>(null);



  useEffect(() => {

    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages, typing]);





  const send = async (text: string) => {


    if (!text.trim()) return;



    setMessages((prev)=>[
      ...prev,
      {
        role:"user",
        content:text
      }
    ]);



    setInput("");

    setTyping(true);



    try {


      const reportText =
        localStorage.getItem(
          "latest_report"
        ) || "";



      console.log(
        "REPORT SENT:",
        reportText
      );


      console.log(
        "QUESTION:",
        text
      );



      const response =
        await api.askAI(
          reportText,
          text
        );



      console.log(
        "AI RESPONSE:",
        response
      );



      setMessages((prev)=>[
        ...prev,
        {
          role:"assistant",
          content:
            response.answer
            ||
            "No answer received"
        }
      ]);



    }

    catch(error:any){


      console.error(
        "FULL CHAT ERROR:",
        error
      );



      setMessages((prev)=>[
        ...prev,
        {
          role:"assistant",
          content:
            "ERROR: "
            +
            error.message
        }
      ]);



    }


    finally{

      setTyping(false);

    }


  };







return (

<div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">



<div className="mb-4 flex items-center gap-4">


<div className="
h-14 w-14 rounded-2xl
gradient-brand
text-white
flex items-center justify-center
">

<Bot className="h-7 w-7"/>

</div>



<div>

<h1 className="text-3xl font-semibold">

AI Medical

<span className="text-gradient">
 Assistant
</span>

</h1>


<p className="text-sm text-muted-foreground">

🟢 Online · MediMind AI

</p>


</div>


</div>







<Card className="
flex-1
flex
flex-col
overflow-hidden
card-premium
">




<div className="
flex-1
overflow-y-auto
p-6
space-y-5
">



{
messages.map(
(msg,index)=>(


<div
key={index}
className={`
flex gap-3
${msg.role==="user" ? "flex-row-reverse":""}
`}
>


<div className="
h-9
w-9
rounded-xl
flex
items-center
justify-center
gradient-brand
text-white
">


{
msg.role==="user"
?
<UserIcon className="h-4 w-4"/>
:
<Bot className="h-4 w-4"/>
}


</div>




<div className={`
max-w-[75%]
rounded-2xl
px-4
py-3
text-sm

${msg.role==="user"
?
"bg-primary text-white"
:
"bg-muted"
}

`}>

{renderMessageContent(msg.content)}

</div>



</div>


)
)

}




{
typing &&

<div className="flex gap-3">

<div className="
h-9
w-9
rounded-xl
gradient-brand
text-white
flex
items-center
justify-center
">

<Bot className="h-4 w-4"/>

</div>


<div className="bg-muted px-4 py-3 rounded-xl">

AI is thinking...

</div>


</div>

}



<div ref={endRef}/>


</div>







{
messages.length===1 &&

<div className="px-6 pb-4">


<div className="
text-xs
flex
items-center
gap-2
mb-2
">

<Sparkles className="h-3 w-3"/>

Try asking

</div>



<div className="flex flex-wrap gap-2">


{
suggestedQuestions.map(q=>(

<button

key={q}

onClick={()=>send(q)}

className="
border
rounded-full
px-3
py-2
text-xs
hover:bg-muted
"

>

{q}

</button>


))
}


</div>


</div>

}







<form

onSubmit={(e)=>{

e.preventDefault();

send(input);

}}

className="
border-t
p-4
flex
gap-2
"


>


<Input

value={input}

onChange={(e)=>
setInput(e.target.value)
}

placeholder="Ask about your report..."



/>



<Button
type="submit"
disabled={!input.trim() || typing}
>

<Send className="h-4 w-4"/>

</Button>



</form>





</Card>


</div>

);


}