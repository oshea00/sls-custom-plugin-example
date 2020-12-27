# Custom Serverless Plugin Development
Example of creating a custom plugin for serverless framework.

## Steps used to create example from sls templates
1. ```>sls create -t aws-csharp -p slsplugindev```
2. ```>cd slsplugindev```
3. ```>mkdir .serverless_plugins```
4. ```>cd .serverless_plugins```
5. ```>sls create -t plugin -p myplugin```
6. Add 'plugins' section to serverless.yml
```
plugins:
 -myplugin
```
7. Edit the index.js file in the myplugin directory replacing the default example
8. Add API Gateway Events ```dotnet add package Amazon.Lambda.APIGatewayEvents```
9. Modify Handler method to accept APIGatewayProxyRequest and return APIGatewayProxyResponse
10. Extra Credit: 
    * Add barebones Program.cs to execute Handler in debugger or via ```dotnet run```
    * Add PropertyGroup to csproj:
        ```
        <PropertyGroup>
            <OutputType>Exe</OutputType>
            <TargetFramework>netcoreapp3.1</TargetFramework>
        </PropertyGroup>
        ```

## Seeing it execute

To get something minimal for serverless to deploy, I chose an aws-csharp template. I've already got a working dotnet
core environment, so just needed to compile using the build.sh script then run the deploy.

This example plugin hooks into the deploy command and adds some custom processing. To see it in action:
```
>sls deploy -s dev -v
```

Of course, I could have used a node or python lambda template instead. The main things to notice in this example
are the specially named folder for project-local plugins and how that lets you use a plugins section reference to your plugin folder as if it were installed via npm.  

At some point you might want to push your plugin to npm. See the references below for more on that, and it was a source for my example here. Recommended reading.


## References
* [How to write and test a serverless plugin](https://dev.to/dvddpl/how-to-write-and-test-a-serverless-plugin-3152)
* [Example plugin project that changes api gateway settings](https://www.twilio.com/blog/2017/10/serverless-framework-plugin-aws-lambda-javascript.html)

## CLI commands needed to manage client certificates on API gateway stage
aws apigateway update-stage --rest-api-id API_ID --stage-name STAGE_NAME --patch-operations '[{"op":"replace","path":"/clientCertificateId","value":"CERTIFICATE_ID"}]'

aws apigateway generate-client-certificate --description 'My First Client Certificate'

get-client-certificate (for expirationDate)

delete-client-certificate (for removing expired certificates from api gateway)

Note: must re-deploy after rotation

## Example plugin code:

Retrieve config information:
```
this.options = options || {};
this.provider = this.serverless.getProvider(this.serverless.service.provider.name);
this.stage = this.options.stage || this.serverless.service.provider.stage;
```

AWS provider request example - getting API id:
```
getApiId() {
   return new Promise(resolve => {
       this.provider.request('CloudFormation', 'describeStacks', {StackName: this.provider.naming.getStackName(this.stage)}).then(resp => {
           const output = resp.Stacks[0].Outputs;
           let apiUrl;
           output.filter(entry => entry.OutputKey.match('ServiceEndpoint')).forEach(entry => apiUrl = entry.OutputValue);
           const apiId = apiUrl.match('https:\/\/(.*)\\.execute-api')[1];
           resolve(apiId);
       });
   });
}
this.getApiId().then(apiId => console.log(apiId['Stacks'][0]['Outputs']));
// requires further parsing of outputs. Look for ServiceEndpoint OutputValue of OutputKey 
// 'ServiceEndpoint'. ApiId will be in string 'https://{apiId}.execute-api...'

```

Create deployment:
```
createDeployment(apiId) {
   return this.provider.request('APIGateway', 'createDeployment', {restApiId: apiId, stageName: this.stage});
}
```


