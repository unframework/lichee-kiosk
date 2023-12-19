#!/usr/bin/env node
import "source-map-support/register";
import * as path from "path";
import { App, Stack, StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecra from "aws-cdk-lib/aws-ecr-assets";
import { Construct } from "constructs";

class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // directly reference the source Dockerfile
    const serverImage = ecs.ContainerImage.fromDockerImageAsset(
      new ecra.DockerImageAsset(this, "KioskServerImage", {
        directory: path.join(__dirname, "../../lichee-image"),
        file: "Dockerfile.ssh",
      })
    );

    // define task for the server
    const vpc = new ec2.Vpc(this, "KioskVPC", {
      maxAzs: 2,
      natGateways: 0,
    });

    const cluster = new ecs.Cluster(this, "KioskCluster", {
      vpc,
    });

    const securityGroup = new ec2.SecurityGroup(
      this,
      "KioskServerSecurityGroup",
      {
        vpc,
        description: "Allow SSH access",
        allowAllOutbound: true,
      }
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow SSH access"
    );

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "KioskServerTask"
    );
    taskDefinition.addContainer("KioskServerContainer", {
      image: serverImage,
      memoryLimitMiB: 512,
    });

    const service = new ecs.FargateService(this, "KioskService", {
      cluster,
      taskDefinition,
      securityGroups: [securityGroup],
    });
  }
}

const app = new App();
new MainStack(app, "KioskStack", {
  env: {
    account: "941159756364",
    region: "ca-central-1",
  },
});
