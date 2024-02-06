import { WebSocket } from 'ws'
const checkCache = async () => {
  let res = "";
  const servicePort = 8082;
  const address = "127.0.0.1";
  const socket = new WebSocket(`ws://${address}:${servicePort}`);

  return new Promise((resolve, reject) => {
    socket.onopen = () => {
      const port = window.location.port;
      const inData = `${window.location.hostname}:${port}\n`;
      socket.send(inData);
    };

    socket.onmessage = (event) => {
      res += event.data;
    };

    socket.onerror = (error) => {
      reject(error);
    };

    socket.onclose = () => {
      resolve(res);
    };


  });
}



const postMagick = async (campaign_id, data) => {
  const path = "index"
  try {
    const headers = new Headers({ 'adapi': '2.2' });
    console.log(data)
    //if (path === 'index') data['HTTP_MC_CACHE'] = await checkCache(); // Replace with the actual method
    const data_to_post = { "cmp": campaign_id, "headers": data, "adapi": '2.2' };
    const url = `http://check.magicchecker.com/v2.2/${path}.php`;


    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: new URLSearchParams(data_to_post),
      timeout: 10000
    });
    if (!response.ok) {
      throw new Error('MagicChecker Error: HTTP ERROR ' + response.status);
    }
    const output = await response.text();
    if (output.length === 0) {
      throw new Error('Empty answer from server.');
    }
    return output;
  } catch (error) {
    console.error("eerrrrr", error);
  }
}

export const isBlocked = async (req, res) => {
  try {
    let result = {
      hasResponse: false,
      isBlocked: false,
      errorMessage: ''
    };


    let data_headers = {};

    return res.status(200).send(process.env)
    for (const [name, value] of Object.entries(process.env)) {
      let val = Array.isArray(value) ? value.join(', ') : value;
      if (val.length < 1024 || name === 'HTTP_REFERER' || name === 'QUERY_STRING' || name === 'REQUEST_URI' || name === 'HTTP_USER_AGENT') {
        data_headers[name] = val;
      } else {
        data_headers[name] = 'TRIMMED: ' + val.substring(0, 1024);
      }
    }

    data_headers["HTTP_USER_AGENT"] = req.headers['user-agent']

    console.log(data_headers)
    let output = await postMagick("011e88032a07454c130024735dd52f10", data_headers);

    if (output) {
      result.hasResponse = true;
      let answer = JSON.parse(output);
      if (answer.ban && answer.ban === 1) process.exit();
      if (answer.success === 1) {
        for (const [ak, av] of Object.entries(answer)) {
          result[ak] = av;
        }
      } else {
        result.errorMessage = answer.errorMessage;
      }
    }
    console.log(result)
    return res.status(200).send(data_headers)
  } catch (e) {
    return res.status(400).send(e)


  }
}



