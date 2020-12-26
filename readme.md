# Custom Serverless Plugin Development
Example of creating a custom plugin for serverless framework.

## Steps
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
This example plugin hooks in the deploy command and adds some custom processing. To see it in action:
```
>sls deploy -s dev -v
```
 
