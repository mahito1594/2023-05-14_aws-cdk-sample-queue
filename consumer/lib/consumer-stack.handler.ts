import { SQSHandler } from "aws-lambda";
import { decorator } from "./src/decorator";

export const handler: SQSHandler = async (event, context) => {
  event.Records.forEach((record) => {
    const { body } = record;
    console.log(decorator(body));
  });
};
