using BackendApp.Models;
using Microsoft.Extensions.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => options.AddPolicy("CorsPolicy", builder => {
    builder
        .AllowAnyMethod()
        .AllowAnyHeader()
        .SetIsOriginAllowed(_ => true)
        .AllowCredentials();
}));
// Add services to the container.
builder.Services.AddControllersWithViews();




var app = builder.Build();


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors("CorsPolicy");

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
pattern: "{controller=Home}/{action=Index}/{id?}");

AzureStorageAccount.Load(app.Configuration.GetSection("AzureStorage"));

app.Run();



