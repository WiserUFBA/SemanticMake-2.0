(
  function() {

    const resForm = document.forms[0]

    const addVocabButton          = document.getElementById('addVocab')
    const addPropButton           = document.getElementById('addProp')
    addPropButton.disabled        = true
    const addSubpropButton        = document.getElementById('addSubprop')
    addSubpropButton.disabled     = true
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
    const calledFunctions         = document.getElementById('calledFunctions')

    const subpropDiv              = document.getElementById('subpropDiv')
    const propValueDiv            = document.getElementById('propValueDiv')

    const propAsResourceCheck     = document.getElementById('propAsResource')
    const subpropAsResourceCheck  = document.getElementById('subpropAsResource')
    const hasSubpropCheck         = document.getElementById('hasSubproperty')

    const addDateTimeCheck          = document.getElementById('addDateTime')
    const addCoordinatescheck       = document.getElementById('addCoordinates')
    const serverApplicationAddress  = document.getElementById('serverApplicationAddress')

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
    resPrefixField        .addEventListener('blur', showCalledFunctions)

    resNameField          .addEventListener('blur', validateField(isNotEmpty))
    resNameField          .addEventListener('blur', showResource)
    resNameField          .addEventListener('blur', showCalledFunctions)

    resAboutField         .addEventListener('blur', validateField(isValidURL))
    resAboutField         .addEventListener('blur', showResource)
    resAboutField         .addEventListener('blur', showCalledFunctions)
    
    vocabPrefixField      .addEventListener('blur', validateField(isNotEmpty))
    vocabURIField.onblur  = validateField(isValidURL)
    vocabPrefixField      .addEventListener('change', validateField(isNotEmpty), false)
    
    propPrefixField       .addEventListener('change', validateField(isNotEmpty))
    $(propNameField)      .on('select2:close', validateField(isNotEmpty))
    $(propNameField)      .on('select2:close', (evt) => {
      if (validateField(isNotEmpty))
        addSubpropButton.disabled = false
    })
    propValueField        .addEventListener('change', validateField(isNotEmpty))

    $(subpropNameField)   .on('select2:close', validateField(isNotEmpty))
    subpropValueField     .addEventListener('blur', validateField(isNotEmpty))

    propValueField        .setAttribute('title', 'Enter a value')
    subpropValueField     .setAttribute('title', 'Enter a value')

    //Trata o evento de 'mudar o valor selecionado' do campo de prefixo do vocabulário, carregando as informações do vocabulário escolhido
    vocabPrefixField.addEventListener('change', (evt) => {
      vocabURIField.value = vocabs[evt.target.value]
    })
    
    propAsResourceCheck.addEventListener('click', (evt) => {
      if (propAsResourceCheck.checked){
        $(propValueField).attr('data-original-title', 'URIs must be valid: http://... ending with / ou #')
        propValueField.onblur = validateField(isValidURL)
      }else{
        $(propValueField).attr('data-original-title', 'Enter a value')
        propValueField.onblur = validateField(isNotEmpty)
      }
    })

    $(propAsResourceCheck).on({
      'mouseenter': (evt) => { 
        if (!hasSubpropCheck.checked){
          $(propValueField).attr('data-original-title', 'URIs must be valid: http://... ending with / ou #')
          $(evt.target).attr('data-original-title', 'Save the URI from another resource')
          $(evt.target).tooltip('show')
        }
        else {
          $(evt.target).attr('data-original-title', 'Blank Node')
          $(evt.target).tooltip('show')
        } },
      'mouseleave': (evt) => { $(evt.target).tooltip('hide') }
    })

    $(hasSubpropCheck).on({
      'mouseenter': (evt) => { $(evt.target).tooltip('show') },
      'mouseleave': (evt) => { $(evt.target).tooltip('hide') }
    })
  
    $(subpropAsResourceCheck).on({
      'mouseenter': (evt) => { $(evt.target).tooltip('show') },
      'mouseleave': (evt) => { $(evt.target).tooltip('hide') }
    })

    $(addDateTimeCheck).on({
        'mouseenter': (evt) => {$(evt.target).tooltip('show')},
        'mouseleave': (evt) => {$(evt.target).tooltip('hide')}
    })

    $(addCoordinatescheck).on({
        'mouseenter': (evt) => {$(evt.target).tooltip('show')},
        'mouseleave': (evt) => {$(evt.target).tooltip('hide')}
    })

    hasSubpropCheck.addEventListener('click', (evt) => {
      if (hasSubpropCheck.checked === true){
        propAsResourceCheck.checked   = true
        propAsResourceCheck.onclick   = () => {return false}
        subpropDiv.style.display      = 'block'
        propValueDiv.style.visibility = "hidden"
      } else {
        subpropValueField.value       = ''
        subpropDiv.style.display      = 'none'
        propAsResourceCheck.onclick   = () => {return true}
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
      placeholder: 'Enter the initials of the property',
      theme: 'bootstrap'
    });

    addVocabButton.onclick = (evt) => {
      if (isEmpty(vocabURIField.value) || isEmpty(vocabPrefixField.value)) return

      const prefix  = vocabPrefixField.value
      const uri     = vocabURIField.value
      
      if (!isValidURL(uri)){
          return;
      }

      toggleValid(vocabURIField, true)
      const vocab = { prefix, uri, properties: [] } 
      //Atribui o objeto 'vocab' (inicialmente sem pares) ao vocabulário de prefixo ('prefix'), do recurso
      resource.vocabularies[prefix] = vocab
      //Habilita o botão de adicionar propriedades
      if(Object.keys(resource.vocabularies).length > 0)
        addPropButton.disabled = false
      //Atualiza a lista de prefixos dos vocabulários usados no campo select
      updatePrefixList()
      //Mostra o recurso na tag '<pre>' de id 'result'
      showResource()

      showCalledFunctions(evt)
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
      placeholder: 'Enter the initials of the subproperty',
      theme: 'bootstrap'
    });


    //Trata o evento de clique do botão de adicionar propriedades 'addPropButton'
    addPropButton.onclick = (evt) => {

      const properties  = getProps(getResourceToSend().vocabularies)
      const prefix      = propPrefixField.value

      if (isEmpty(propPrefixField.value) || isEmpty(propNameField.value) || isEmpty(propValueField.value)){
        result.innerHTML += '\n\nRequired field(s) empty'
        return
      }


      if(!propExists(properties) && isNotEmpty(propValueField.value)){
        const propertyName  = propNameField.value
        const value         = propValueField.value
        const asResource    = propAsResourceCheck.checked
        const subPropertyOf = ''
        const property = { propertyName, value, asResource, subPropertyOf }
        if (!propAsResourceCheck.checked) {
          resource.vocabularies[prefix].properties.push(property)
        }
        else if(propAsResourceCheck.checked && propValueField.value.includes('http://')){

          resource.vocabularies[prefix].properties.push(property)
        }          
      }
      console.log(JSON.stringify(getResourceToSend()))
      showCalledFunctions(evt)
      //Mostra o recurso na tag '<pre>' de id 'result'
      showResource()
    }
      subpropAsResourceCheck.addEventListener('click', (evt) => {
      if (propAsResourceCheck.checked && subpropAsResourceCheck.checked){
        $(subpropValueField).attr('data-original-title', 'URIs must be valid: http://... ending with / ou #')
        subpropValueField.onblur = validateField(isValidURL)
      }else{
        $(subpropValueField).attr('data-original-title', 'Enter a value')
        subpropValueField.onblur = validateField(isNotEmpty)
      }
    })

    addSubpropButton.onclick = (evt) => {
      if (isEmpty(propPrefixField.value) || isEmpty(propNameField.value) || 
          isEmpty(subpropNameField.value) || isEmpty(subpropValueField.value)){
        result.innerHTML += '\n\nRequired field(s) empty'
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
              const asResource    = propAsResourceCheck.checked
              const subPropertyOf = ''
              const property = { propertyName, value, asResource, subPropertyOf }
              resource.vocabularies[prefix].properties.push(property)
          }
          const propertyName  = subpropNameField.value
          const value         = subpropValueField.value
          const asResource    = subpropAsResourceCheck.checked
          const subPropertyOf = propNameField.value
          const property = { propertyName, value, asResource, subPropertyOf }
          if (!subpropAsResourceCheck.checked) {
            resource.vocabularies[prefix].properties.push(property)
          }
          else if(subpropAsResourceCheck.checked && subpropValueField.value.includes('http://')){
            resource.vocabularies[prefix].properties.push(property)
          }          
        }
      }
      console.log(JSON.stringify(getResourceToSend()))
      showCalledFunctions(evt)
      //Mostra o recurso na tag '<pre>' de id 'result'
      showResource()
    }
    saveButton.onclick = (evt) => {
      if (!validateForm()) return

      //Reseta alguns campos da página
      resForm.elements.vocabPrefix.value  = ''
      resForm.elements.vocabUri.value     = ''
      resForm.elements.propName.value     = ''
      resForm.elements.propValue.value    = ''
      
      showCalledFunctions(evt)
      //Mostra o recurso na tag '<pre>' de id 'result'
      showResource()
      //Envia a cópia do recurso
      sendResource('workspace-84b4df42')
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
          //Verifica se a URL é válida ou se o valor é vazio (de acordo com a função passada)
          const valid = validationFunc(elem.value)
          //Configura o valor do elemento como válido
          toggleValid(elem, valid)
          //Configura o estado da tooltip para ser mostrada ou escondida
          const tooltipAction = !valid ? 'show' : 'hide'
          //Apresenta ou esconde a tooltip
          $(elem).tooltip(tooltipAction);
        }
      }

    function validateForm(){

      if (!hasSubpropCheck.checked){
        if(propAsResourceCheck.checked){
          if( isNotEmpty(propNameField.value) && isValidURL(resAboutField.value) && 
              isNotEmpty(vocabPrefixField.value) &&  isValidURL(vocabURIField.value) &&
              isNotEmpty(propNameField.value) && isValidURL(propValueField.value))
            return true
          else return false
        } else{
          if( isNotEmpty(propNameField.value) && isValidURL(resAboutField.value) && 
              isNotEmpty(vocabPrefixField.value) &&  isValidURL(vocabURIField.value) &&
              isNotEmpty(propNameField.value) && isNotEmpty(propValueField.value))
            return true
          else
            return false
        }
      } else {
        if(subpropAsResourceCheck.checked){
          if( isNotEmpty(propNameField.value) && isValidURL(resAboutField.value) && 
              isNotEmpty(vocabPrefixField.value) &&  isValidURL(vocabURIField.value) &&
              isNotEmpty(propNameField.value) && isNotEmpty(subpropNameField.value) && isValidURL(subpropValueField.value))
            return true
          else return false
        } else{
          if( isNotEmpty(propNameField.value) && isValidURL(resAboutField.value) && 
              isNotEmpty(vocabPrefixField.value) &&  isValidURL(vocabURIField.value) &&
              isNotEmpty(propNameField.value) && isNotEmpty(subpropNameField.value) && isNotEmpty(subpropValueField.value))
            return true
          else
            return false
      }
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
    function sendResource(workspace) {
      //Adiciona data e hora de salvamento do recurso
      if(addDateTimeCheck.checked)
        addDateTime()      
      
      //Adiciona coordenadas
      if(addCoordinatescheck.checked){
        addCoordinatesAndSave(workspace)
      } else{
        //Faz uma cópia do resultado e atrabui à variável resToSend
        const resToSend = getResourceToSend()
        //Envia o conteúdo (cópia do recurso) ao servidor
        fetchSendResource(workspace, resToSend)
      }
    }

    function fetchSendResource(workspace, resToSend){
      return fetch(`/resources/saveResource/${workspace}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8'},
        body: JSON.stringify(resToSend)
      }).then(function(response) {
        if(response.ok){
          result.classList.add('save-success')
          result.innerHTML += '<br/><br/><h5>Resource saved successfuly</h5>'
        }
        else{
          result.classList.add('has-error')
          result.innerHTML += `<br/><br/><h5>Error trying to write resource</h5><br/>${status}<br/>${status.message}</br>${status.toString}`
        }
      //Este bloco trata o evento da conexão estar indisponível
      }).catch(function(error) {
        result.classList.add('has-error')
        result.innerHTML += `<br/><br/><h3>Connection problem when trying to save the ontology<h3><br/><br/>${error.message}`
      });
    }

    function addDateTime() {
      if(!vocabularyIcalExists()){
        const vocab = { prefix: 'ical', uri: 'http://www.w3.org/2002/12/cal/ical#', properties: [] }
        resource.vocabularies['ical'] = vocab 
      }
      now = new Date()
      const dateTimeCreated = `${now.getFullYear()}/${now.getMonth()}/${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
      const created = { propertyName: 'created', value: dateTimeCreated, asResource: false, subPropertyOf:'' }
      resource.vocabularies['ical'].properties.push(created)    
    }
    //Trecho para pegar a geolocalização
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function addCoordinatesAndSave(workspace){
      //Verifica se o navegador tem suporte a geolocalização
      if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(function (position){
            if(!vocabularySchemaExists()){
              const vocab = { prefix: 'schema', uri: 'http://schema.org', properties: [] }
              resource.vocabularies['schema'] = vocab 
            }
            const locale = { propertyName: 'geocoordinates', value: '', asResource: true, subPropertyOf:'' }
            resource.vocabularies['schema'].properties.push(locale)
      
            const latitude = { propertyName: 'latitude', value: position.coords.latitude, asResource: false, subPropertyOf:'geocoordinates' }
            resource.vocabularies['schema'].properties.push(latitude)
            const longitude = { propertyName: 'longitude', value: position.coords.longitude, asResource: false, subPropertyOf:'geocoordinates' }
            resource.vocabularies['schema'].properties.push(longitude)
      
            //Faz uma cópia do resultado e atrabui à variável resToSend
            const resToSend = getResourceToSend()
            console.log(resToSend)
            //Envia o conteúdo (cópia do recurso) ao servidor
            fetchSendResource(workspace, resToSend)
          })
      else
        console.log("Browser doesn't support geolocation!");
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function vocabularySchemaExists(){
      for (let vocabulary of Object.values(resource.vocabularies))
        if (vocabulary.prefix === 'schema')
          return true;
      return false;
    }

    function vocabularyIcalExists(){
      for (let vocabulary of Object.values(resource.vocabularies))
        if (vocabulary.prefix === "ical")
          return true;
      return false;
    }
    
    //Faz um recurso para ser enviado
    function getResourceToSend() {
      const vocabularies      = Object.values(resource.vocabularies)
      const resToSend         = Object.assign({}, resource)
      resToSend.vocabularies  = vocabularies
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
      let options    = `<option value="" title="">Select</option>`
      options        += prefixes.map(prefix => (
          `<option value="${prefix}">${prefix}</option>`
      ))
      //Atualiza lista de prefixos do campo select de id 'propPrefix'
      resForm.elements.propPrefix.innerHTML = options
      resForm.elements.propPrefix.value = prefixes[prefixes.length - 1]
    }

    function propListSize(properties){
      let qtProperties = 0
      for(let property of properties){
         qtProperties++
      }
      return qtProperties
    }

    function propExists(properties){
      
      if (propListSize(properties) == 0)       
        return false
      
      if (propListSize(properties) > 0)
        if(hasSubpropCheck.checked){
          for (let property of properties)
            if(isNotEmpty(propNameField.value) && isNotEmpty(subpropNameField.value) && 
               isNotEmpty(subpropValueField.value) && property.propertyName == propNameField.value){
                  //Agora que atendeu a condição do valor do campo do nome da propriedade ser igual ao nome da propriedade no par
                  //Verifica se existe algum outro par que tenha a propriedade vigente como subpropriedade
                  const propMaster = property.propertyName
                  for (let property2 of properties)
                    if ((property2.subPropertyOf == propMaster) && (property2.propertyName == subpropNameField.value))
                      return true
            }
        return false
        }
        else {
          for (let property of properties)
            if(isNotEmpty(propNameField.value) && isNotEmpty(propValueField.value) && property.propertyName == propNameField.value)
              return true
            return false
        }
    }

    function getProps(vocabularies){
      let props = [];
      //Adiciona um prefixo a cada par de valores com o mesmo prefixo do vocabulário
      for (let vocab of vocabularies) {
          const properties = vocab.properties.map(property =>
              Object.assign({}, property, { prefix: vocab.prefix })
          )
          //Adiciona o par (agora com o prefixo) à lista de propriedades
          props = props.concat(properties)
      }
      return props
    }
 
    //Mostra o RDF, essa função é chamada para montar o conteúdo a ser mostrado na tag '<pre>'
    const showRDF = () => {
        //Pega um recurso a ser enviado
        const resToSend = getResourceToSend();
        //Monta a string com o prefixo e o nome do recurso
        let resourceHead = `xmlns:${resource.prefix}="${resource.about}"`
        //Monta a string que mostra todos os vocabulários usados
        let vocabulariesString = resToSend.vocabularies.map(vocab => `xmlns:${vocab.prefix}="${vocab.uri}"`).join("\n   ");
        //Cria uma variável que vai ser usada para guardar todas as propriedades de todos os vabulários usados
        const propsString = mountPropertiesString(resToSend.vocabularies)
        //Verifica se o nome do recurso é vazio e apresenta 'rdf:Desciption' se for
        const rootNodeString = isEmpty(resource.name) ? 'rdf:Description' : `${resource.prefix}:${resource.name}`

        const rdf = `Output format:
 <rdf:RDF
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns"
   ${resourceHead}
   ${vocabulariesString}
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
          const properties = vocab.properties.map(property =>
              Object.assign({}, property, { prefix: vocab.prefix, verified: false })
          )
          //Adiciona o par (agora com o prefixo) à lista de propriedades
          props = props.concat(properties)
      }
      //Slice cria uma cópia do array
      const p1 = props.slice()
      for (let i = 0; i < props.length; i++){
        //Se a propriedade é um recurso
        if (p1[i].asResource){
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
                    RDFprops.push(`    <${p1[i].prefix}:${p2[k].propertyName}>${p2[k].value}</${p1[i].prefix}:${p2[k].propertyName}>`)
                }
                p1[k].verified = true
              }
            }
            RDFprops.push(`</${p2[K_].prefix}:${p1[i].propertyName}>`)
          }
        } 
        //Se não é um recurso e não tem subpropriedades
        else if (!p1[i].verified && !p1[i].asResource){
          RDFprops.push(`<${p1[i].prefix}:${p1[i].propertyName}>${p1[i].value}</${p1[i].prefix}:${p1[i].propertyName}>`)
          p1[i].verified = true
        }
      }
                      
      RDFprops = RDFprops.join('\n       ')
      
      return RDFprops        
    }

    function showCalledFunctions(evt){
      const res         = getResourceToSend()
      const props       = getProps(res.vocabularies)
      let vocabularies  = []
      let utilities     = []
      RDFprops          = []

      for (let vocab of res.vocabularies){
        vocabularies.push(`r.addVocabulary("${vocab.prefix}", "${vocab.uri}")`)
      }
      let addVocabularies = vocabularies.join('\n')
      for(let p of props){
        if(p.value != ''){
          RDFprops.push(`const p = new Property("${p.propertyName}", "${p.value}", "${p.asResource}", "${p.subPropertyOf}")
r.addTriple("${p.prefix}", p)`)
        } 
      }
      let addProperties = RDFprops.join('\n')
      let end = ''
      if (evt.target === saveButton){
        let dateTime = (addDateTimeCheck.checked)? 'r.addDateTime()' :'r.addDateTime(\"workspace\")'
        if(addDateTimeCheck.checked){
          utilities.push('r.addDateTime()')
        }
        if(addCoordinatescheck.checked){
          utilities.push('api.addCoordinatesAndSave()')
        }else{
          utilities.push('api.sendResource(r)')
        }
        end = utilities.join('\n')
      }
      let out = `Correspondent code (Sample):
const config = {
    datasetName:    'datasetName'                 //Optional
    datasetAddress: 'http://datasetAddress:3030'  //Optional
    baseURL:        'http://applicationServerAddress:8080/',
    workspace:      'workspaceName'
}
const api = new SemanticAPI(config)      

let r = new Resource("${res.name}", "${res.prefix}", "${res.about}")

${addVocabularies}
 
${addProperties}
 
${end}`
      calledFunctions.innerText = out
    }
}()
)