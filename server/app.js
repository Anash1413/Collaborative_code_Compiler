const express = require("express")
const dotenv = require("dotenv").config()
const axios = require("axios")
const cors = require("cors")
const PORT = process.env.PORT
const http = require('http')
const { WebSocketServer } = require('ws')
// Import the core y-websocket room setup utility
const { setupWSConnection } = require('y-websocket/bin/utils')
const JUDGE0_BASE_URL =process.env.JUDGE0_URL
const app = express()

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

const encode64 = (str) => Buffer.from(str || "", "utf-8").toString("base64");
const decode64 = (str) => Buffer.from(str || "", "base64").toString("utf-8");

app.post("/api/runcode", async (req, res, next) => {
  const { code, lang_Id, stdin } = req.body;
  if (!code || !lang_Id) {
    return res.status(400).json({
      error: "code or the language id is missing please retry err_001",
    });
  }
  try {
    const submitresponse = await axios.post(
      `${JUDGE0_BASE_URL}/submissions?base64_encoded=true&fields=*`,
      {
        source_code: encode64(code),
        language_id: lang_Id,
        stdin: encode64(stdin),
      },
      { headers: { 'Content-Type': 'application/json' }, },
    );
    const { token } = submitresponse.data;
    let result = null;
    const delay = 1000;
    const maxretry = 10;

    for (let i = 0; i < maxretry; i++) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      const checkresponse = await axios.get(
        `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=true&fields=*`,
     
      );
      if (checkresponse.data.status.id >= 3) {
        result = checkresponse.data;
        break;
      }
    }
    if (!result) {
      return res
        .status(408)
        .json({ error: "Execution timed out while waiting in queue." });
    }
  //  console.log(result)
    return res.json({
      status: result.status.description,
      statusId: result.status.id,
      stdout: decode64(result.stdout),
      stderr: decode64(result.stderr),
      post_execution_filesystem: decode64(result.stderr),
      compile_output: decode64(result.compile_output),
      time: result.time,
      memory: result.memory,
    });
  } catch (error) {
    console.error(
      "Judge0 error hai malik ",
      error.response?.data || error.message,
    );
    return res
      .status(500)
      .json({
        error: "Failed to compile code",
        details: error.response?.data || error.message,
      });
  }
});
const server = http.createServer(app)
//yaha pr websocket server ko http server pr mount kr diya hai
const wss  = new WebSocketServer({noServer:true})
 wss.on('connection', ( socket ,request) =>{
  const docName = request.url.slice(1).split('?')[0]
  setupWSConnection(socket, request  , {docName})          
 })

 server.on('upgrade',( req , socket,  head)=>{
    if(req.url.startsWith('/yjs')){
      req.url =  req.url.replace('/yjs' , '')
      wss.handleUpgrade(req , socket, head ,(ws)=>{
      wss.emit('connection' , ws , req)

      })
    }
    else {
      socket.destroy()
    }
 })

server.listen(PORT, () => {
  console.log(
    `your node js server is running on http://localhost:${PORT} by Anash Khan`,
  );
});
