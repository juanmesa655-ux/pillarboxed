using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pillarboxed.Application.Commands.Resenas;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Application.Queries.Resenas;

namespace Pillarboxed.API.Controllers;

public class ResenasController(IMediator mediator) : BaseController
{
    [HttpGet("pelicula/{peliculaId}")]
    public async Task<IActionResult> GetResenas(int peliculaId) =>
        Ok(await mediator.Send(new GetResenasByPeliculaQuery(peliculaId)));

    [Authorize]
    [HttpGet("mias")]
    public async Task<IActionResult> GetMisResenas()
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new GetMisResenasQuery(UsuarioId.Value)));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateResena([FromBody] CrearResenaDto dto)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new CreateResenaCommand(UsuarioId.Value, UsuarioNombre, dto)));
    }

    [Authorize]
    [HttpDelete("{peliculaId}")]
    public async Task<IActionResult> DeleteResena(int peliculaId)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new DeleteResenaCommand(UsuarioId.Value, peliculaId)));
    }
}
