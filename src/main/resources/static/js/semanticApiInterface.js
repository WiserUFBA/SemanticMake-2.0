(
  function() {

    const resForm = document.forms[0]

    const addVocabButton          = document.getElementById('addVocab')
    const addPropButton           = document.getElementById('addProp')
    const addSubpropButton        = document.getElementById('addSubprop')
    const saveButton              = document.getElementById('save')

    const resPrefixField          = document.getElementById('resPrefix')
    const resNameField            = document.getElementById('resName')
    const resAboutField           = document.getElementById('resAbout')

    const vocabURIField           = document.getElementById('vocabUri')
    const vocabPrefixField        = document.getElementById('vocabPrefix')

    const propPrefixField         = document.getElementById('propPrefix')
    const propNameField           = document.getElementById('propName')
    const propValueField          = document.getElementById('propValue')

    const subpropNameField        = document.getElementById('subpropName')
    const subpropValueField       = document.getElementById('subpropValue')

    const result                  = document.getElementById('result')
    const structDataTable         = document.getElementById('listStrutcData')

    const subpropDiv              = document.getElementById('subpropDiv')
    const propValueDiv            = document.getElementById('propValueDiv')

    const propAsResourceCheck     = document.getElementById('propAsResource')
    const subpropAsResourceCheck  = document.getElementById('subpropAsResource')
    const hasSubpropCheck         = document.getElementById('hasSubproperty')


    const vocabs = {
      cc: 'http://creativecommons.org/ns#',
      dcat: 'http://www.w3.org/ns/dcat#',
      dce: 'http://purl.org/dc/elements/1.1/',
      dcterms: 'http://purl.org/dc/terms/',
      event: 'http://purl.org/NET/c4dm/event.owl#',
      foaf: 'http://xmlns.com/foaf/0.1/',
      prov: 'http://www.w3.org/ns/prov#',
      vcard: 'http://www.w3.org/2006/vcard/ns#',
      schema: 'http://schema.org/',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#'
    }

    const resource = {
      vocabularies: {}
    }

    //Trata o evento de 'perder o foco' do campo de inserir a URI do recurso, validando-o
    //Usa .addEventListener para adidionar mais de uma função ao mesmo evento
    resPrefixField        .addEventListener('blur', validateField(isNotEmpty))
    resPrefixField        .addEventListener('blur', showResource)

    resNameField          .addEventListener('blur', showResource)
    resNameField          .addEventListener('blur', validateField(isNotEmpty))

    resAboutField         .addEventListener('blur', showResource)
    resAboutField         .addEventListener('blur', validateField(isValidURL))
    
    vocabPrefixField      .addEventListener('blur', validateField(isNotEmpty))
    vocabURIField.onblur  = validateField(isValidURL)
    vocabPrefixField      .addEventListener('change', validateField(isNotEmpty), false)
    
    propPrefixField       .addEventListener('change', validateField(isNotEmpty))
    $(propNameField)      .on('select2:close', validateField(isNotEmpty))
    propValueField        .addEventListener('blur', validateField(isNotEmpty))

    $(subpropNameField)   .on('select2:close', validateField(isNotEmpty))
    subpropValueField     .addEventListener('blur', validateField(isNotEmpty))

    propValueField        .setAttribute('title', 'Insira um valor')
    subpropValueField     .setAttribute('title', 'Insira um valor')

    //Trata o evento de 'mudar o valor selecionado' do campo de prefixo do vocabulário, carregando as informações do vocabulário escolhido
    vocabPrefixField.addEventListener('change', (evt) => {
      vocabURIField.value = vocabs[evt.target.value]
    })
    
    propAsResourceCheck.addEventListener('click', (evt) => {
      if (propAsResourceCheck.checked){
        propValueField     .setAttribute('title', 'As URIs devem ser válidas: http://... terminando com / ou #')
        propValueField.onblur = validateField(isValidURL)
      }else{
        subpropValueField     .setAttribute('title', 'Insira um valor')
        propValueField.onblur = validateField(isNotEmpty)
      }
    })
  
    hasSubpropCheck.addEventListener('click', (evt) => {
      if (hasSubpropCheck.checked === true){
        propAsResourceCheck.checked = true
        propAsResourceCheck.onclick = () => {return false}
        subpropDiv.style.display = 'block'
        propValueDiv.style.visibility = "hidden"
      }else {
        subpropValueField.value = ''
        subpropDiv.style.display = 'none'
        propAsResourceCheck.onclick = () => {return true}
        propValueDiv.style.visibility = "visible"
      }
    })

    $('#propName').select2({ 
      ajax: { 
        url: '/resources/getVocabularyData?',
        dataType: 'json',  
        data: function (params) { 
          // Query parameters will be ?vocabPrefix=[propPrefixField.value]&search=[term]&type=public 
          var query = {vocabPrefix: propPrefixField.value, search: params.term}
          return query; 
        },
        // Tranforms the top-level key of the response object from 'items' to 'results'
        processResults: function (data) {
          items = data
          //Coloca a estrutura do JSON da forma correta para não ter <OptGroup></OptGroup>
          //const items = data.map(prop => ({ id: prop, text: prop }))
          return {results: items};

        },
        cache: true                
      },
      placeholder: 'Digite as iniciais da propriedade',
      theme: 'bootstrap'
    });

    addVocabButton.onclick = () => {
      if (isEmpty(vocabURIField.value) || isEmpty(vocabPrefixField.value)) return

      const prefix = vocabPrefixField.value
      const uri = vocabURIField.value
      
      if (!isValidURL(uri)){
          return;
      }

      toggleValid(vocabURIField, true)
      const vocab = { prefix, uri, pairs: [] } 
      //Atribui o objeto 'vocab' (inicialmente sem pares) ao vocabulário de prefixo ('prefix'), do recurso
      resource.vocabularies[prefix] = vocab
      //Atualiza a lista de prefixos dos vocabulários usados no campo select
      updatePrefixList()
      //Mostra o recurso na tag '<pre>' de id 'result'
      showResource()
    }

    $('#subpropName').select2({ 
      ajax: { 
        url: '/resources/getVocabularyData',
        dataType: 'json',  
        data: function (params) { 
          // Query parameters will be ?vocabPrefix=[propPrefixField.value]&search=[term]&type=public 
          var query = {vocabPrefix: propPrefixField.value, search: params.term}
          return query; 
        },
        // Tranforms the top-level key of the response object from 'items' to 'results'
        processResults: function (data) {
          items = data
          //Coloca a estrutura do JSON da forma correta para não ter <OptGroup></OptGroup>
          //const items = data.map(prop => ({ id: prop, text: prop }))
          return {results: items};
        },
        cache: true                
      },
      placeholder: 'Digite as iniciais da propriedade',
      theme: 'bootstrap'
    });

    //Trata o evento de clique do botão de adicionar propriedades 'addPropButton'
    addPropButton.onclick = () => {

      const properties  = getProps(getResourceToSend().vocabularies)
      const prefix      = propPrefixField.value

      if(!propExists(properties)){
        const propertyName  = propNameField.value
        const value         = propValueField.value
        const asResouce     = propAsResourceCheck.checked
        const subPropertyOf = ''
        const pair = { propertyName, value, asResouce, subPropertyOf }
        if (!propAsResourceCheck.checked) {
          resource.vocabularies[prefix].pairs.push(pair)
        }
        else if(propAsResourceCheck.checked && propValueField.value.includes('http://')){
          resource.vocabularies[prefix].pairs.push(pair)
        }          
      }
      console.log(JSON.stringify(getProps(getResourceToSend().vocabularies)))
      showGeneratedData()
      //Mostra o recurso na tag '<pre>' de id 'result'
      showResource()
    }

    subpropAsResourceCheck.addEventListener('click', (evt) => {
      if (propAsResourceCheck.checked && subpropAsResourceCheck.checked){
        subpropValueField.setAttribute('title', 'As URIs devem ser válidas: http://... terminando com / ou #')
        subpropValueField.onblur = validateField(isValidURL)
      }else{
        subpropValueField.setAttribute('title', 'Insira um valor')
        subpropValueField.onblur = validateField(isNotEmpty)
      }
    })

    addSubpropButton.onclick = () => {
      if (isEmpty(propPrefixField.value) || isEmpty(propNameField.value) || 
          isEmpty(subpropNameField.value) || isEmpty(subpropValueField.value)){
        result.innerHTML += '\n\nCampo(s) requerido(s) vazio(s)'
        return
      }
      else if (propAsResourceCheck.checked && hasSubpropCheck.checked) {
        
        const properties  = getProps(getResourceToSend().vocabularies)
        const prefix      = propPrefixField.value

        if (!propExists(properties)){
            
          if(isNotEmpty(subpropNameField.value) && isNotEmpty(subpropValueField.value) && 
              qtdePropertiesWithSubproperties(propNameField.value) == 0){
              const propertyName  = propNameField.value
              const value         = ''
              const asResouce     = propAsResourceCheck.checked
              const subPropertyOf = ''
              const pair = { propertyName, value, asResouce, subPropertyOf }
              resource.vocabularies[prefix].pairs.push(pair)
          }
          const propertyName  = subpropNameField.value
          const value         = subpropValueField.value
          const asResouce     = subpropAsResourceCheck.checked
          const subPropertyOf = propNameField.value
          const pair = { propertyName, value, asResouce, subPropertyOf }
          if (!subpropAsResourceCheck.checked) {
            resource.vocabularies[prefix].pairs.push(pair)
          }
          else if(subpropAsResourceCheck.checked && subpropValueField.value.includes('http://')){
            resource.vocabularies[prefix].pairs.push(pair)
          }          
        }
      }
      console.log(JSON.stringify(getProps(getResourceToSend().vocabularies)))
      showGeneratedData()
      //Mostra o recurso na tag '<pre>' de id 'result'
      showResource()
    }
    saveButton.onclick = () => {
      if (!validateForm()) return

      //Reseta alguns campos da página
      resForm.elements.vocabPrefix.value = ''
      resForm.elements.vocabUri.value = ''
      resForm.elements.propName.value = ''
      resForm.elements.propValue.value = ''
      //Mostra o recurso na tag '<pre>' de id 'result'
      showResource()
      //Envia a cópia do recurso
      sendResource()
    }
      //Muda o comportamento padrão da tooltip que é ser mostrada apenas quando se passa o mouse por cima do elemento
      $('[data-toggle="tooltip"]').tooltip({ trigger: 'manual' })

      //Insere ou remove a classe de erro do css do bootstrap
      function toggleValid(elem, valid) {
        valid ? elem.classList.remove('has-error') : elem.classList.add('has-error')
      }

      //Verifica se a função é válida
      //Esta função está validando URLs e não URIs
      function isValidURL(uri){
        if (uri === '') return false;
        //Expressão regular para validar uma URL
        const regexp = /(http):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
        //Retorna true ou false para o valor da variável atender ou não a expressão regular
        return regexp.test(uri);
      }

      function isEmpty(value) {
        return value == null || value.trim() === ''
      }

      function isNotEmpty(value) {
        return !isEmpty(value)
      }
      
      function qtdePropertiesWithSubproperties(prop){
        const properties = getProps(getResourceToSend().vocabularies)
        let qtdePropertiesWithSubproperties = 0
        for(let p of properties){
          if(p.propertyName == propNameField.value && p.subPropertyOf == '')
            qtdePropertiesWithSubproperties++
        }
        return qtdePropertiesWithSubproperties
      }

      //Função que valida o valor do campo que a chamou
      function validateField(validationFunc) {
        return function(evt) {
          //Pega o elemento que disparou a função
          const elem = evt.target
          //Verifica se a URL é válida
          const valid = validationFunc(elem.value)
          //Configura o valor do elemento com válido
          toggleValid(elem, valid)
          //Configura o estado da tooltip para ser mostrada ou escondida
          const tooltipAction = !valid ? 'show' : 'hide'
          //Apresenta o esconde a tooltip
          $(elem).tooltip(tooltipAction);
        }
      }

    function validateForm(){
      if (!hasSubpropCheck.checked){
        if(isValidURL(resAboutField.value) && isValidURL(vocabURIField.value) &&
            isNotEmpty(vocabPrefixField.value) && isNotEmpty(propNameField.value) && isNotEmpty(propValueField.value))
            return true
        else return false
      } else{
        if(isValidURL(resAboutField.value) && isValidURL(vocabURIField.value) && isValidURL(subpropValueField.value) &&
            isNotEmpty(vocabPrefixField.value) && isNotEmpty(propNameField.value) && isNotEmpty(propValueField.value) && 
            isNotEmpty(subpropNameField.value) && isNotEmpty(subpropValueField.value))
            return true
        else return false
      }
    }

    function showResource() {
      updateResource()
      showRDF()
    }

    function updateResource(){
      const prefix  = resPrefixField.value
      const name    = resNameField.value
      const about   = resAboutField.value

      /**
       * O método Object.assign() é usado para copiar os valores de todas as propriedades próprias enumeráveis de um
       * ou mais objetos de origem para um objeto destino: Object.assign(destino, ...origens)
       * Copia os valores de '{ prefix, name, about }' e adiciona ao resource
       */
      Object.assign(resource, { prefix, name, about })
    }

    //Envia o recurso
    function sendResource() {
      //Faz uma cópia do resultado e atrabui à variávek resToShow
      const resToSend = getResourceToSend()
      //Envia o conteúdo (cópia do recurso) ao servidor
      fetch('/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8'},
        body: JSON.stringify(resToSend)
      }).then(function(response) {
        if(response.ok)
          result.innerHTML += '<br/><br/><h3>Recurso salvo com sucesso</h3>'
        else
          result.innerHTML += `<br/><br/><h3>Erro ao tentar gravar ontologia</h3><br/>${status}<br/>${status.message}</br>${status.toString}`
      //Este bloco trata o evento da conexão estar indisponível
      }).catch(function(error) {
          result.innerHTML += `<br/><br/><h3>Problema de conexão ao tentar salvar a ontologia<h3><br/><br/>${error.message}`
        });
    }

    //Faz um recurso para ser enviado
    function getResourceToSend() {
      const vocabularies = Object.values(resource.vocabularies)
      const resToSend = Object.assign({}, resource)
      resToSend.vocabularies = vocabularies
      return resToSend

    }

    //Função para atualizar a lista de prefixos do campo select de prefixos dos vocabulários usados
    function updatePrefixList() {
      /**
       * Object.keys pega a lista de prefixos dos vocabulários do recurso
       * função map itera sobre a lista de prefhixos dos vocabulários
       * Cada chave da lista de 'prefix' é passada como parâmetro para a função anônima que retorna a string dentro da crase `...`
       * A string detro da crase aceita string e variáveis, que podem ser acessadas com a seguinte sintaxe ${variavel}
      */
      const prefixes = Object.keys(resource.vocabularies) 
      let options    = `<option value="" title="">Selecione</option>`
      options        += prefixes.map(prefix => (
          `<option value="${prefix}">${prefix}</option>`
      ))
      //Atualiza lista de prefixos do campo select de id 'propPrefix'
      resForm.elements.propPrefix.innerHTML = options
      resForm.elements.propPrefix.value = prefixes[prefixes.length - 1]
    }

    function propListSize(pairs){
      let qtPairs = 0
      for(let pair of pairs){
         qtPairs++
      }
      return qtPairs
    }

    function propExists(pairs){
      
      if (propListSize(pairs) == 0)       
        return false
      
      if (propListSize(pairs) > 0)
        if(hasSubpropCheck.checked){
          for (let pair of pairs)
            if(isNotEmpty(propNameField.value) && isNotEmpty(subpropNameField.value) && 
               isNotEmpty(subpropValueField.value) && pair.propertyName == propNameField.value){
                  //Agora que atendeu a condição do valor do campo do nome da propriedade ser igual ao nome da propriedade no par
                  //Verifica se existe algum outro par que tenha a propriedade vigente como subpropriedade
                  const propMaster = pair.propertyName
                  for (let pair2 of pairs)
                    if ((pair2.subPropertyOf == propMaster) && (pair2.propertyName == subpropNameField.value))
                      return true
            }
        return false
        }
        else {
          for (let pair of pairs)
            if(isNotEmpty(propNameField.value) && isNotEmpty(propValueField.value) && pair.propertyName == propNameField.value)
              return true
            return false
        }
    }

    function getProps(vocabularies){
      let props = [];
      //Adiciona um prefixo a cada par de valores com o mesmo prefixo do vocabulário
      for (let vocab of vocabularies) {
          const pairs = vocab.pairs.map(pair =>
              Object.assign({}, pair, { prefix: vocab.prefix })
          )
          //Adiciona o par (agora com o prefixo) à lista de propriedades
          props = props.concat(pairs)
      }
      return props
    }
 
    //Mostra o RDF, essa função é chamada para montar o conteúdo a ser mostrado na tag '<pre>'
    const showRDF = () => {
        //Pega um recurso a ser enviado
        const resToSend = getResourceToSend();
        //Monta a string que mostra todos os vocabulários usados
        let vocabulariesString = resToSend.vocabularies.map(vocab => `xmlns:${vocab.prefix}="${vocab.uri}"`).join("\n  ");
        //Cria uma variável que vai ser usada para guardar todas as propriedades de todos os vabulários usados
        const propsString = mountPropertiesString(resToSend.vocabularies)
        //Verifica se o prefixo do recurso ou seu nome não são vazios e adiciona à lista de vocabulários
        if (!isEmpty(resource.prefix) && !isEmpty(resource.name)) {
            vocabulariesString = `xmlns:${resource.prefix}="${resource.about}"\n    ` + vocabulariesString
        }
        //Verifica se o nome do recurso é vazio e apresenta 'rdf:Desciption' se for
        const rootNodeString = isEmpty(resource.name) ? 'rdf:Description' : `${resource.prefix}:${resource.name}`

        const rdf = `<rdf:RDF
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns"
  ${vocabulariesString}
>
  <${rootNodeString} rdf:about="${resource.about}/uid">
      ${propsString}
  </${rootNodeString}>
</rdf>`;

          //Deve ser usado innerText para apresentar o texto e não o html na página
          result.innerText = rdf;
          
    }

    const mountPropertiesString = (vocabularies) => {

      RDFprops = []
      //Cria uma variável que vai ser usada para guardar todas as propriedades de todos os vabulários usados
      let props = [];
      //Adiciona um prefixo a cada par de valores com o mesmo prefixo do vocabulário
      for (let vocab of vocabularies) {
          const pairs = vocab.pairs.map(pair =>
              Object.assign({}, pair, { prefix: vocab.prefix, verified: false })
          )
          //Adiciona o par (agora com o prefixo) à lista de propriedades
          props = props.concat(pairs)
      }
      //Slice cria uma cópia do array
      const p1 = props.slice()
      for (let i = 0; i < props.length; i++){
        //Se a propriedade é uma recurso
        if (p1[i].asResouce){
          //Represents the property that have one simple resource: <vocab:property rdf:resource="http://site.com"/>
          if(!p1[i].verified && isEmpty(p1[i].subPropertyOf) && p1[i].value.includes('http://')){
            RDFprops.push(`<${p1[i].prefix}:${p1[i].propertyName} rdf:resource="${p1[i].value}" />`)
            p1[i].verified = true
          }
          //Represents the begins of a resource: <vocab:property rdf:parseType="Resource">
          if(!p1[i].verified && isEmpty(p1[i].value) && isEmpty(p1[i].subPropertyOf)){
            RDFprops.push(`<${p1[i].prefix}:${p1[i].propertyName} rdf:parseType="Resource" />`)
            p1[i].verified = true
 
            //Slice cria uma cópia do array
            const p2 = p1.slice()
            let K_ = 0
            for (let k = 0; k < p2.length; k++){
              K_ = k
              //Se o nome da propriedade i é igual à subpropriedade k 
              if(p1[i].propertyName === p2[k].subPropertyOf){
                //Represents the subproperty like simple resource: <vocab:property rdf:resource="http://knows.com"/
                if (p2[k].value.includes('http://')){
                  if(!p1[k].verified && isNotEmpty(p2[k].propertyName) && isNotEmpty(p2[k].value))
                    RDFprops.push(`    <${p1[i].prefix}:${p2[k].propertyName } rdf:resource="${p2[k].value}"/>`)
                }//Se subpropriedade não é um recurso
                else 
                  if (!p1[k].verified && isNotEmpty(p2[k].propertyName) && isNotEmpty(p2[k].value)){
                    RDFprops.push(`    <${p1[i].prefix}:${p2[k].propertyName}>${p2[k].value}</${p1[i].propertyName}:${p2[k].propertyName}>`)
                }
                p1[k].verified = true
              }
            }
            RDFprops.push(`</${p2[K_].prefix}:${p1[i].propertyName}>`)
          }
        } 
        //Se não é um recurso e não tem subpropriedades
        else if (!p1[i].verified && !p1[i].asResouce){
          RDFprops.push(`<${p1[i].prefix}:${p1[i].propertyName}>${p1[i].value}</${p1[i].prefix}:${p1[i].propertyName}>`)
          p1[i].verified = true
        }
      }
                      
      RDFprops = RDFprops.join('\n      ')
      
      return RDFprops        
    }

    function showGeneratedData(){
      const res       = getResourceToSend()
      const props     = getProps(res.vocabularies)
      let trs  = ''
      const tbody = structDataTable.querySelector('tbody');
      for(let p of props){
        trs += renderStructProperty(p)
      }
      tbody.innerHTML = trs
    }

    function renderStructProperty(property) {
      const subPropertyOf = isEmpty(property.subPropertyOf) ? "\"\"" : property.subPropertyOf
      return `
          <tr>
              <td>${property.propertyName}&ensp;&ensp;</td>
              <td>${property.value}&ensp;&ensp;&ensp;</td>
              <td>${property.asResouce}&ensp;&ensp;</td>
              <td>${subPropertyOf}</td>
          </tr>
      `;
  }
  

}()
)