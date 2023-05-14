import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import * as dotenv from "dotenv";

dotenv.config();
const REGION = process.env.AWS_REGION;
const QUEUE_URL = process.env.QUEUE_URL;

const sendMessage = async (message: string) => {
  const client = new SQSClient({ region: REGION });
  const input = {
    QueueUrl: QUEUE_URL,
    MessageBody: message,
  };
  const command = new SendMessageCommand(input);

  try {
    const result = await client.send(command);
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

sendMessage("Hello SQS!");
