using ManagementBTOnline_API.Data;
using ManagementBTOnline_API.Filters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ManagementBTOnline_API.Middleware;
using ManagementBTOnline_API.Hubs; //đăng ký Middleware

var builder = WebApplication.CreateBuilder(args);


//Đăng ký dịch vụ SignLR
builder.Services.AddSignalR();


builder.Services.AddControllers();

builder.Services.AddScoped<AuditLogFilter>(); //Dang ky filter

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    // AddAuthentication: Sử dụng JWT Bearder để xác thực người dùng
    //Back end sẽ tìm token ở Authorization: Bearer <token>

    //AddJwtBearer: Token đó là  JWT và hãy sử dụng cơ chế JWT Bearer để kiểm tra nó
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            //Luật kiểm tra JWT
            ValidateIssuer = true, //JWT có được phát sinh đúng server mà mình tin hay không
            //Khi JWT quay trở lại Backend, nói :""Tôi chỉ chấp nhận JWT có iss = ManagementBTOnline."

            ValidateAudience = true, //JWT có được cấp cho đúng đối tượng sử dụng không?
            //"JWT này phải được cấp đúng cho ManagementBTOnlineFrontend."

            ValidateLifetime = true, //JWT còn hạn sử dụng không
            ValidateIssuerSigningKey = true, //JWT có thực sự được ký bằng key mà Backend tin tưởng không?

            ValidIssuer = builder.Configuration["Jwt:Issuer"], //Issuer mà backend chấp nhận
            ValidAudience = builder.Configuration["Jwt:Audience"], //Audience mà Backend chấp nhận.

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Key"]!
                //key dùng để kiểm tra chữ ký JWT.
                /*
                 {
                      "Jwt": {
                        "Key": "my-super-secret-key"
                      }
                    }

                    code lấy "my-super-secret-key"
                    Encoding.UTF8.GetBytes(...) sử dụng khi kiểm tra chữ ký

                    ASP.NET Core, khi nhận JWT từ Frontend, 
                   hãy dùng JWT Bearer và chỉ chấp nhận token 
                   nếu nó đúng người phát hành, đúng đối tượng, 
                   chưa hết hạn và có chữ ký hợp lệ bằng secret key 
                   của Server."

                 
                 */
                )
            )
        };
    });
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDBContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
        );
});

//Cấu hình CORS bắt buộc cho SignaLR phải có 
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); //bắt buộc cho WebSocket/ SignaLR
    });
});


//Build app
var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseCors("AngularPolicy");

//Map endpoint của SignaLR Hub
app.MapHub<DashboardHub>("/hub/dashboard");

app.UseStaticFiles(); //Mục đích: cho phép Angular/Browser truy cập file đã upload
// wwwroot/uploads/images/abc.jpg
//sẽ truy cập https://localhost:xxxx/uploads/images/abc.jpg

app.UseMiddleware<GlobalExceptionMiddleware>(); //middlware

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
