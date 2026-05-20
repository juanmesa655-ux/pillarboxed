using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pillarboxed.Application.Commands.Eventos;
using Pillarboxed.Application.Queries.Eventos;

namespace Pillarboxed.API.Controllers;

public class EventosController(IMediator mediator) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetEventos([FromQuery] string? tipo) =>
        Ok(await mediator.Send(new GetEventosQuery(UsuarioId, tipo)));

    [Authorize]
    [HttpPost("{id}/inscribirse")]
    public async Task<IActionResult> Inscribirse(int id)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new InscribirseCommand(UsuarioId.Value, id)));
    }

    [Authorize]
    [HttpDelete("{id}/inscribirse")]
    public async Task<IActionResult> CancelarInscripcion(int id)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new CancelarInscripcionCommand(UsuarioId.Value, id)));
    }
}
