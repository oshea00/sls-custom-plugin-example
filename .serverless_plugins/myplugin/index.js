'use strict';


class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;


    this.hooks = {
//      'before:deploy:deploy': this.beforeDeployService.bind(this),
      'after:deploy:deploy': this.afterDeployService.bind(this),
    };
  }

  beforeDeployService () {
    // Inspect the serverless object passed into plugin.
    // Custom 'censor' function nips circular references.
    var cache = []
    this.serverless.cli.log(JSON.stringify(this.serverless,
      (key,value) => {
        if (typeof value === 'object' && value !== null) {
          // Duplicate reference found, discard key
          if (cache.includes(value)) return '[circular ref]';

          // Store value in our collection
          cache.push(value);
        }
        return value;      
    },2), 'Serverless instance: ') 
  }

  async afterDeployService() {
    // Retrieve array of stack outputs. Might be useful
    // for retrieving names for further post-processing.
    console.log('DEBUG: some info.')
    this.serverless.cli.log("Service deployed...")
    var stack = await this.retrieveOutputs()
    this.serverless.cli.log(JSON.stringify(stack,undefined,2), 'Stack outputs: ') 
  }

  async retrieveOutputs() {
        return this.serverless.getProvider('aws').request(
            'CloudFormation',
            'describeStacks',
            {StackName: this.stackName},
            this.serverless.getProvider('aws').getStage(),
            this.serverless.getProvider('aws').getRegion()
        ).then(described=> described.Stacks[0].Outputs)
  }
}

module.exports = ServerlessPlugin;
