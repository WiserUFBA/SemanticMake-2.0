
   var btnSubmit = document.getElementById('buttonFormSubmit')
   btnSubmit.onclick = function(event){
      event.preventDefault()
      const config = {
      baseURL:      'http://localhost:8080/',
      workspace:    'workspace'
      }
      const api = new SemanticAPI(config)
      const resource = new Resource('contactData', 'contact', 'http://contactmail.com#Person')
      resource.addVocabulary('schema', 'http://schema.org/')
      resource.addVocabulary('vcard', 'http://www.w3.org/2006/vcard/ns#')
      const emailValue = document.getElementById('inputEmail').value
      
      /**
       * Dessa forma são criadas duas propriedades como subpropriedades de email
       */
      resource.addTriple('vcard', 'hasValue', emailValue, false, 'email')
      resource.addTriple('vcard', 'client', 'clientEmail', false, 'email')
      
      const nameValue = document.getElementById('inputName').value
      resource.addTriple('schema', 'name', nameValue, false, '')
      const subjectValue = document.getElementById('inputSubject').value
      resource.addTriple('schema', 'about', subjectValue, false, '')
      const telValue = document.getElementById('inputTel').value
      resource.addTriple('schema', 'telephone', telValue, false, '' )
      const messageValue = document.getElementById('inputMessage').value
      resource.addTriple('schema', 'text', messageValue, false, '')
      resource.addCoordinatesDateTime()
      resource.addLanguage('pt-br');
      api.saveResource(resource)
         .then(json => alert(`Recurso salvo com sucesso\nSeu workspace é: ${json.workspace}\nO ID do recurso é: `))
         .catch(error => alert(`Problema de conexão ao tentar salvar a ontologia\n${error.message}`))
      api.deleteGraph()
         .then(json => alert(`Workspace '${json.workspace}' foi removido`))
         .catch(error => alert(`Problema ao tentar deletar workspace: ${error.message}`))
      api.deleteResource("http://pessoa.com/53a70cfb-4232-4da5-9fa5-a112b5aa3695")
         .then(json => alert(`O recurso '${json.resourceId}' foi removido do workspce '${json.workspace}'`))
         .catch(error => alert(`Problema de conexão ao tentar deletar recurso: ${error.message}`))
      const res = api.getResource("workspace", "http://adivinhasoponto.sdfgsdfgsdfg.com/cd4c4e6e-1ec6-48b2-bdf5-ad4a66ddfc21")
      let now = new Date()
      now = now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + '' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds()
      api.updateProperty(   'http://contactmail.com#Person/b5da8d07-c30c-4f73-970f-4c5f919aefc7', 
                            'http://www.w3.org/2002/12/cal/ical#created', 
                            'teste')
        .then(json => alert(`A propriedade do recurso foi atualizada`))
        .catch(json => alert(`Falha ao tentar atualizar o recurso`))
    api.deleteProperty('http://contactmail.com#Person/87fea239-891f-4911-a74a-b291dde17bb9', 'http://purl.org/dc/terms/language')
    .then(json => alert(`A propriedade com URI '${json.propertyURI}', do recurso '${json.resourceId}', do workspace '${json.workspace}', foi removida`))
    .catch(error => alert(`Problema de conexão ao tentar deletar propriedade: ${error.message}`))
    api.getResources('http://schema.org/name', 'Lucimar da Silva Souza')
    .then(resources => console.log(resources))
    .catch(err => alert(`Problema ao tentar recuperar recursos`))


   }