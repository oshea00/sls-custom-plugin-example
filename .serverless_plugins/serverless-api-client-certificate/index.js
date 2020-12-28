'use strict';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options || {};
    this.provider = this.serverless.getProvider(this.serverless.service.provider.name);
    this.stage = this.options.stage || this.serverless.service.provider.stage;

    this.custom = this.serverless.service.custom ? 
      this.serverless.service.custom.serverlessApiClientCertificate || { 'rotateCerts' : false }  :
      { 'rotateCerts' : false }

    this.hooks = {
      //'before:deploy:deploy': this.beforeDeployService.bind(this),
      'after:deploy:deploy': this.afterDeployService.bind(this),
    };
  }

  safePrettyStringify(item) {
    var cache = []
    return JSON.stringify(item,(key,value)=>{
      if (typeof value === 'object' && value !== null) {
        // Duplicate reference found, discard key
        if (cache.includes(value)) return '[circular ref]';
  
        // Store value in our collection
        cache.push(value);
      }
      return value;      
  
    },2)
  }

  // for debugging
  beforeDeployService () {
    // Inspect the serverless object passed into plugin.
    var cache = []
    this.serverless.cli.log(this.safePrettyStringify(this.serverless.service.custom), 'Serverless instance: ') 
  }

  async afterDeployService() {
    // Let's update stage to include a client certificate if:
    // - current certificate is expired - then rotate (config option is true for rotate).
    // - one hasn't been assigned
    this.serverless.cli.log("Check Client Certificate...")
    var apiId = await this.getApiId()
    var stage = await this.getStage(apiId,this.stage)
    if (stage.clientCertificateId) {
      // stage is assigned a client certificate - check expiration
      // and rotate if rotateCerts is true
      var expirationDate = await this.getExpiration(stage.clientCertificateId)
      var daysRemaining = this.datediff(new Date(),expirationDate)
      this.serverless.cli.log(`Client Certificate Expiration: ${expirationDate}`)
      if (daysRemaining <= this.custom.daysLeft) {
        if (this.custom.rotateCerts) {
          var newCert = await this.generateCertificate()
          this.serverless.cli.log(`certificate has expired - rotating to new certificate ${newCert}`)
          await this.assignCertificateToStage(apiId,this.stage,newCert)
          this.createDeployment(apiId)
        } else {
          this.serverless.cli.log('WARNING: certificate has expired - set rotateCerts: true to rotate')
        }
      }  
    } else {
      // No client certificate - create and assign
      var certId = await this.generateCertificate()
      this.serverless.cli.log(`Created certificate: ${certId}`)
      await this.assignCertificateToStage(apiId,this.stage,certId)
      this.createDeployment(apiId)
    }
  }

  assignCertificateToStage(apiId,stage,certId) {
    //aws apigateway update-stage --rest-api-id API_ID --stage-name STAGE_NAME --patch-operations '[{"op":"replace","path":"/clientCertificateId","value":"CERTIFICATE_ID"}]'
    return new Promise(resolve=>{
      this.provider.request('APIGateway','updateStage',{
        restApiId: apiId,
        stageName: stage,
        patchOperations: [
          {
            op: 'replace',
            path: '/clientCertificateId',
            value: certId
          }
        ]
      }).then(resp=>resolve(resp))
    })

  }

  generateCertificate() {
    return new Promise(resolve=>{
      this.provider.request('APIGateway','generateClientCertificate',{
        description: `${this.provider.naming.getStackName(this.stage)}`
      }).then(resp=>resolve(resp.clientCertificateId))
    })
  }

  datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
  }

  getExpiration(certificateId) {
    return new Promise(resolve=>{
      this.provider.request('APIGateway','getClientCertificate',{
        clientCertificateId: certificateId
      }).then(resp=>resolve(resp.expirationDate))
    })
  }

  getStage(apiId,stage) {
    return new Promise(resolve => {
      this.provider.request('APIGateway','getStage',{
        restApiId: apiId,
        stageName: stage
      }).then(resp=>resolve(resp))
    })
  }

  getApiId() {
    return new Promise(resolve => {
        this.provider.request('CloudFormation', 'describeStacks', {
          StackName: this.provider.naming.getStackName(this.stage)
        }).then(resp => {
            const output = resp.Stacks[0].Outputs;
            let apiUrl;
            output.filter(entry => entry.OutputKey.match('ServiceEndpoint')).forEach(entry => apiUrl = entry.OutputValue);
            const apiId = apiUrl.match('https:\/\/(.*)\\.execute-api')[1];
            resolve(apiId);
        });
    });
  }

  createDeployment(apiId) {
    return this.provider.request('APIGateway', 'createDeployment', {restApiId: apiId, stageName: this.stage});
  }

}

module.exports = ServerlessPlugin;
