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

