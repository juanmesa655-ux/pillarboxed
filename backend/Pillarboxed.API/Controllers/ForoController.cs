using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pillarboxed.Application.Commands.Foro;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Application.Queries.Foro;

namespace Pillarboxed.API.Controllers;

public class ForoController(IMediator mediator) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetHilos() =>
        Ok(await mediator.Send(new GetHilosQuery()));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetHilo(int id) =>
        Ok(await mediator.Send(new GetHiloByIdQuery(id)));

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateHilo([FromBody] CrearHiloDto dto)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new CreateHiloCommand(UsuarioId.Value, UsuarioNombre, dto)));
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHilo(int id)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new DeleteHiloCommand(UsuarioId.Value, id)));
    }

    [Authorize]
    [HttpPost("{hiloId}/respuestas")]
    public async Task<IActionResult> CreateRespuesta(int hiloId, [FromBody] CrearRespuestaDto dto)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new CreateRespuestaCommand(hiloId, UsuarioId.Value, UsuarioNombre, dto)));
    }

    [Authorize]
    [HttpDelete("{hiloId}/respuestas/{respuestaId}")]
    public async Task<IActionResult> DeleteRespuesta(int hiloId, int respuestaId)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new DeleteRespuestaCommand(UsuarioId.Value, respuestaId)));
    }
}
