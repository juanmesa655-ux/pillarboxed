namespace Pillarboxed.Application.Common;
public class ApiResponse<T>
{
    public bool Ok { get; set; }
    public string? Mensaje { get; set; }
    public T? Data { get; set; }

    public static ApiResponse<T> Exito(T data, string? mensaje = null) =>
        new() { Ok = true, Data = data, Mensaje = mensaje };

    public static ApiResponse<T> Error(string mensaje) =>
        new() { Ok = false, Mensaje = mensaje };
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse Exito(string? mensaje = null) =>
        new() { Ok = true, Mensaje = mensaje };

    public new static ApiResponse Error(string mensaje) =>
        new() { Ok = false, Mensaje = mensaje };
}
