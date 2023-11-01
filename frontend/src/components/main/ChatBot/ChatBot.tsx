import { Button, TextField } from "@mui/material";
import React, { useState } from "react";
import swal from "sweetalert";
// import {BsRobot } from "react-icons/bs"

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any>([]);
  const [open, setOpen] = useState(false);

  const handleChange = (e: any) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (input.trim() === "") {
      return;
    }
    try {
      const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer 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", // Thay YOUR_API_KEY bằng API Key của bạn
        },
        body: JSON.stringify({
          prompt: input,
          max_tokens: 1000,
          model: "text-davinci-003",
        }),
      });
      setInput("");
      const data = await response.json();
      setMessages([
        ...messages,
        { text: input },
        { text: data.choices[0].text, bot: true },
      ]);
      setInput("");
    } catch (error) {
      swal("Notice", "Server Error", "error");
    }
  };

  return (
    <div
      style={{
        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        position: "fixed",
        bottom: 0,
        right: 0,
        zIndex: 999,
        background: "#fff",
        margin: 12,
      }}
    >
      {open === false && <div onClick={()=> setOpen(true)} style={{ padding: 10, display: "flex", justifyContent: 'center', alignItems: 'center', borderRadius: "50%", cursor: "pointer"}}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1200px-ChatGPT_logo.svg.png" style={{width: 40, height: 40}} alt="" />
        </div>}
      {open === true && (
        <div
          style={{
            width: 400,
            borderRadius: 10,
            padding: 10,
            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
            position: "fixed",
            bottom: 0,
            right: 0,
            zIndex: 999,
            background: "#fff",
            margin: 12,
          }}
        >
        <div style={{width: "100%", display: "flex", flexDirection: "row-reverse", padding: 10, alignItems: 'center'}}>
            <Button onClick={()=> setOpen(false)} color={"primary"} variant="contained">Close</Button>
        </div>
          <div
            className="chatbot-messages"
            style={{
              width: "400",
              maxHeight: 400,
              overflow: "auto",
              height: 400,
            }}
          >
            {messages.map((message: any, index: any) => (
              <div
                key={index}
                className={message.bot ? "bot-message" : "user-message"}
              >
                <div className={"message-text"}>{message.text?.split("\n")?.map((item: any)=> <div>{item}</div>)}</div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <TextField
                style={{ flex: 1, maxHeight: 50, margin: "12px 0", border: "none" }}
                type="text"
                value={input}
                onChange={handleChange}
              />
              <Button
                color={"primary"}
                variant={"contained"}
                type="submit"
                style={{ height: 50, marginLeft: 12, width: 60 }}
              >
                Send
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;