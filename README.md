# Semantic API

Projeto desenvolvido para auxiliar no desenvolvimento de aplicações web que objetivam guardar conteúdo semântico. A API 
foi desenvolvida em JAVA utilizando o framework JENA, que facilita a manipulação de conteúdo semântico. É abstraído o 
local de armazenamento e é retornado o nome do endereço para que novas inserções no espaço de trabalho sejam feitas.

## Requisitos

- Java 8+
- Maven 3+

## Execução

```
$ mvn spring-boot:run
```

## Uso

Deve ser feita a importação da biblioteca cliente em JavaScript que é direcionada a esta API. Há os métodos para adicionar
vocabulários (addVocabulary), triplas (addTriple) e salvar o conteúdo do recurso (saveResource). Há quatro formas de 
representação do conteúdo:

- Uma propriedade como tripla que guarda sujeito, predicado e literal
- Uma propriedade como tripla que guarda sujeito, predicado e URI de outro recurso
- Uma subpropriedade como tripla que guarda sujeito, predicado e literal 
- Uma subpropriedade como tripla que guarda sujeito, predicado e URI de outro recurso 

Para esclerimento de como devem ser passados os dados foi desenvolvida uma interface que mostra a estrutura dos dados
à medida que são formados e paralelamente são apresentados os argumentos que devem ser passados para formar a estrutura
em questão.
