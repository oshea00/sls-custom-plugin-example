# Custom Serverless Plugin Development
Example of creating a custom plugin for serverless framework. In this case, solving a real problem.

Serverless framework doesn't provide a way to manage client certificates on Rest Api stages. 

This plugin will check the deployed api stage for the existence of a client certificate. 

If certificate exists and has not expired, it simply displays the current expiration date, otherwise, if configured to rotate to a new certificate, it will create and assign a new one. If the Api stage is not assigned to a certificate, then one will be created and assigned to the Api stage.

To configure, add a custom configuration section:
```
plugins:
  - serverless-api-client-certificate

custom:
  serverlessApiClientCertificate:
    rotateCerts: true
    daysLeft: 30
```
* The 'rotateCerts' parameter will determine whether to auto-rotate the certificate
* The 'daysLeft' parameter will determine how many days are left until expiration before rotating a new certificate.


## Steps used to create starting example from sls templates
1. ```>sls create -t aws-csharp -p slsplugindev```
2. ```>cd slsplugindev```
3. ```>mkdir .serverless_plugins```
4. ```>cd .serverless_plugins```
5. ```>sls create -t plugin -p myplugin```
7. Edit the index.js file in the myplugin directory replacing the default example.
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

## Notes
I learned that the serverless framework ```provider.request``` invokes the javascript 'aws-sdk'. Once that was
obvious, I found the documentation (link below) for the sdk to be invaluable.

## References
* [How to write and test a serverless plugin](https://dev.to/dvddpl/how-to-write-and-test-a-serverless-plugin-3152)
* [Example plugin project that changes api gateway settings](https://www.twilio.com/blog/2017/10/serverless-framework-plugin-aws-lambda-javascript.html)
* [aws-sdk documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#updateStage-property)
