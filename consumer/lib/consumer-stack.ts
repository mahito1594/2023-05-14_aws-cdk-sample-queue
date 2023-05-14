import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path = require("path");

export class ConsumerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const role = new Role(this, "lambda-sqs-sample-role", {
      roleName: "lambda-sqs-sample-role",
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("SecretsManagerReadWrite"),
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaSQSQueueExecutionRole"
        ),
      ],
    });

    new NodejsFunction(this, "sample-queue-handler", {
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.X86_64,
      entry: path.join(__dirname, "consumer-stack.handler.ts"),
      handler: "handler",
      timeout: Duration.seconds(10),
      environment: {
        BASE_URL: process.env.BASE_URL ?? "",
      },
      role: role,
    });
  }
}
