using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pillarboxed.Application.Commands.Vistas;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Application.Queries.Vistas;

namespace Pillarboxed.API.Controllers;

[Authorize]
public class VistasController(IMediator mediator) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetVistas()
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new GetVistasQuery(UsuarioId.Value)));
    }

    [HttpPost]
    public async Task<IActionResult> AddVista([FromBody] VistaDto dto)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new AddVistaCommand(UsuarioId.Value, dto)));
    }

    [HttpDelete("{peliculaId}")]
    public async Task<IActionResult> RemoveVista(int peliculaId)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new RemoveVistaCommand(UsuarioId.Value, peliculaId)));
    }
}
