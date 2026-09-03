# Pacote seguro para importação das tabelas oficiais IBS/CBS

Este pacote não inventa códigos oficiais de cClassTrib, CST ou cCredPres.

Uso correto:

1. Baixar as tabelas oficiais dos portais indicados no IT 2025.002 v1.50.
2. Preencher/importar os CSVs conforme os modelos deste pacote.
3. Subir os arquivos pela UI administrativa do Lovable.
4. Conferir status e readiness antes de liberar cálculo definitivo.

## Fontes oficiais a usar

- Tabelas CST e Classificação Tributária cClassTrib:
  - Portal Nacional NF-e > Documentos > Diversos
  - Portal DF-e/SVRS > TabelaClassificacaoTributaria
  - Portal consumo.tributos.gov.br > classificações tributárias
- Tabela Crédito Presumido cCredPres:
  - Portal DF-e/SVRS > TabelaCreditoPresumido
- JSON/SVRS:
  - Portal DF-e/SVRS > CFF/Servicos, mediante certificado digital

## Regra de segurança

- Não popular manualmente cClassTrib, CST ou cCredPres.
- Não usar tabela de terceiros como fonte definitiva, salvo para conferência.
- Manter versão, data de publicação, vigência e raw_json da linha importada.
- Bloquear cálculo definitivo enquanto cClassTrib e CST estiverem vazias.
- Marcar crédito presumido como pendente enquanto cCredPres estiver vazia.

## Ordem de carga recomendada

1. rt_cst_oficial
2. rt_cclasstrib_oficial
3. rt_cred_pres_oficial
4. rt_ncm_nbs_vinculacao, quando disponível
5. rt_cbenef_oficial, quando aplicável
6. rt_simples_anexo_faixa e rt_simples_partilha_ibs_cbs, quando houver fonte oficial operacional

