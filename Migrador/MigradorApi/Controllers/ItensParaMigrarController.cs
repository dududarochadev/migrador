using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Migrador.Dados;
using Migrador.Dados.Enumeradores.Centris;
using Migrador.Dados.Projecoes;
using AuthorizeAttribute = Microsoft.AspNetCore.Authorization.AuthorizeAttribute;

namespace Migrador.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/ItensParaMigrar")]
    public class ItensParaMigrarController : Controller
    {
        private readonly ContextoMigrador _db;

        public ItensParaMigrarController(ContextoMigrador ContextoMigrador)
        {
            _db = ContextoMigrador;
        }

        /// <summary>
        /// Obter a configuração de migração.
        /// </summary>
        [HttpGet]
        [Route("ObterUnidades")]
        public List<ProjecaoDeEstabelecimento> ObterUnidades()
        {
            var estabelecimentos = _db.DbEstabelecimento.Where(e => e.Codigo != "0").Select(e =>
            new ProjecaoDeEstabelecimento
            {
                Id = e.Id,
                Nome = e.Nome
            });

            return estabelecimentos.ToList();
        }

        /// <summary>
        /// Incluir a configuração da migração.
        /// </summary>
        [HttpGet]
        [Route("ObterItensParaMigrar")]
        public List<ProjecaoDeEnumerador> ObterItensParaMigrar()
        {
            return Helpers.ObterDescricoesEnumerador(typeof(ItensParaMigrar));
        }

        /// <summary>
        /// Obter a configuração de migração.
        /// </summary>
        [HttpPost]
        [Route("AtualizarEstabelecimentosSelecionados")]
        public ActionResult AtualizarEstabelecimentosSelecionados(int[] ids)
        {
            try
            {
                var estabelecimentos = _db.DbEstabelecimento.Where(e => ids.Contains(e.Id)).ToList();

                foreach (var estabelecimento in estabelecimentos)
                {
                    estabelecimento.Migrar = true;
                }

                _db.SaveChanges();
            }
            catch
            {
                return BadRequest("Erro ao atualizar os estabelecimentos selecionados!");
            }

            return Ok();
        }
    }
}