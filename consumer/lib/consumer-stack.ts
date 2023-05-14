import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path = require("path");

export class ConsumerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new NodejsFunction(this, "sample-queue-handler", {
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.X86_64,
      entry: path.join(__dirname, "consumer-stack.handler.ts"),
      handler: "handler",
      timeout: Duration.seconds(10),
      environment: {
        BASE_URL: process.env.BASE_URL ?? "",
      },
    });
  }
}
