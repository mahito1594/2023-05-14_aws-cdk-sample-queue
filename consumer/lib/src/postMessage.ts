import axios from "axios";

const BASE_URL = process.env.BASE_URL;

export const postMessage = async (accessToken: string, message: string) => {
  console.log(
    `Post message with ${JSON.stringify({
      accessToken: accessToken,
      body: message,
    })}`
  );
  const result = await axios
    .post(
      "/anything",
      { message: message },
      {
        baseURL: BASE_URL,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    )
    .then<{ ok: false } | { ok: true; data: any }>((res) => {
      if (res.statusText !== "OK") {
        console.error(`Received response is ${res}`);
        return { ok: false };
      }

      return { ok: true, data: JSON.parse(res.data.data) };
    })
    .catch<{ ok: false }>((err) => {
      console.error(err);
      return { ok: false };
    });

  return result;
};
