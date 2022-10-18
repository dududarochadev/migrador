using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.Extensions.Configuration;
using Migrador.Autenticacao;
using Migrador.Dados.Projecoes;
using Refit;

namespace Migrador
{
    /// <summary>
    /// Classe para manipulação dos arquivos de configuração
    /// </summary>
    public static class Helpers
    {
        public static T GetApi<T>()
        {
            var tokenService = new TokenService();
            var token = tokenService.GetTokenWithClientCredentials();

            var timeoutMigracao = Convert.ToInt32(GetAppSettings("TimeoutMigracao"));

            var client = new HttpClient
            {
                BaseAddress = new Uri(GetAppSettings("UrlCentrisApi")),
                Timeout = TimeSpan.FromMinutes(timeoutMigracao)
            };

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.Result.access_token);

            var api = RestService.For<T>(client);

            return api;
        }

        /// <summary>
        /// Método para obter os valores das chaves do AppSettings
        /// </summary>
        /// <param name="key">Chave do AppSettings</param>
        /// <returns>Valor da chave do AppSettings</returns>
        public static string GetAppSettings(string key)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile($"appsettings.json")
                .AddEnvironmentVariables();

            var configuration = builder.Build();
            return configuration[key];
        }

        /// <summary>
        /// Método para obter os valores das chaves do AppSettings
        /// </summary>
        /// <param name="tipoEnumerador">Chave do AppSettings</param>
        /// <returns>Valor da chave do AppSettings</returns>
        public static List<ProjecaoDeEnumerador> ObterDescricoesEnumerador(Type tipoEnumerador)
        {
            var descricoes = new List<ProjecaoDeEnumerador>();

            var names = Enum.GetNames(tipoEnumerador);

            foreach (var name in names)
            {
                var member = tipoEnumerador.GetMembers().Single(w => w.Name == name);
                var attributes = member.GetCustomAttributes(typeof(DescriptionAttribute), false);

                if (attributes.Any())
                {
                    descricoes.Add(new ProjecaoDeEnumerador
                    {
                        Id = member.Name,
                        Descricao = ((DescriptionAttribute)attributes[0]).Description
                    });
                }
            }

            return descricoes;
        }
    }
}