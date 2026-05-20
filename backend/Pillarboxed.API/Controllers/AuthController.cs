using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pillarboxed.Application.Commands.Auth;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Application.Queries.Auth;

namespace Pillarboxed.API.Controllers;

public class AuthController(IMediator mediator) : BaseController
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto) =>
        Ok(await mediator.Send(new RegisterCommand(dto)));

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto) =>
        Ok(await mediator.Send(new LoginCommand(dto)));

    [Authorize]
    [HttpGet("perfil")]
    public async Task<IActionResult> GetPerfil()
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new GetPerfilQuery(UsuarioId.Value)));
    }
}
