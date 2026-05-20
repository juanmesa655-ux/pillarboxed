using Microsoft.Data.SqlClient;
using System.Data;

namespace Pillarboxed.Infrastructure.Data;

public class SqlConnectionFactory(string connectionString)
{
    public IDbConnection CreateConnection() => new SqlConnection(connectionString);
}
