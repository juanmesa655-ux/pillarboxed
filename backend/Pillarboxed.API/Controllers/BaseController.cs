using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Pillarboxed.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    protected int? UsuarioId =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    protected string UsuarioNombre =>
        User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
}
