using AwsDotnetCsharp;

public class Program {
    public static void Main(string[] args) {
        var handler = new Handler();
        handler.Hello(new Amazon.Lambda.APIGatewayEvents.APIGatewayProxyRequest()); 
    }
}