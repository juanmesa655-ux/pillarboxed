namespace Pillarboxed.Application.DTOs;
public record RegisterDto(string Nombre, string Email, string Password);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, int Id, string Nombre, string Email);
public record PerfilDto(string Nombre, string Email, int TotalWishlist, int TotalVistas, int TotalResenas);
