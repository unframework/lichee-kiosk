#!/usr/bin/env node
import "source-map-support/register";
import { App, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }
}

const app = new App();
new MainStack(app, "LicheeKioskStack", {
  env: {
    account: "941159756364",
    region: "ca-central-1",
  },
});
