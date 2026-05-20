using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pillarboxed.Application.Commands.Wishlist;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Application.Queries.Wishlist;

namespace Pillarboxed.API.Controllers;

[Authorize]
public class WishlistController(IMediator mediator) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetWishlist()
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new GetWishlistQuery(UsuarioId.Value)));
    }

    [HttpPost]
    public async Task<IActionResult> AddToWishlist([FromBody] WishlistItemDto dto)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new AddToWishlistCommand(UsuarioId.Value, dto)));
    }

    [HttpDelete("{peliculaId}")]
    public async Task<IActionResult> RemoveFromWishlist(int peliculaId)
    {
        if (UsuarioId is null) return Unauthorized();
        return Ok(await mediator.Send(new RemoveFromWishlistCommand(UsuarioId.Value, peliculaId)));
    }
}
