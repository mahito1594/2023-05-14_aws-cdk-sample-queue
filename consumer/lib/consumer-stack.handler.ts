import { SQSHandler } from "aws-lambda";
import { getAccessToken } from "./src/auth";
import { postMessage } from "./src/postMessage";

export const handler: SQSHandler = async (event, context) => {
  const tokenResult = await getAccessToken();

  if (!tokenResult.ok) {
    console.error("Authentication Fail");
    return;
  }

  console.log(`Access Token: ${tokenResult.accessToken}`);

  for (const { body } of event.Records) {
    const postResult = await postMessage(tokenResult.accessToken, body);
    console.log(`Recieved...${JSON.stringify(postResult)}`);
  }
};
